import React, { useContext, useEffect, useState, useLayoutEffect } from "react";
import {SafeAreaView, Alert, Text, View, FlatList} from 'react-native';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons'
import { color } from '../../utility';
import { LogOutUser,UpdateUser } from "../../network";
import { clearAsyncStorage } from "../../asyncStorage";
import { uuid, smallDeviceHeight } from "../../utility/constants";
import firebase from "../../firebase/config";
import { Profile, ShowUsers, StickyHeader } from "../../component";
import { Store } from "../../context/store";
import ImagePicker from "react-native-image-picker";
import { deviceHeight } from "../../utility/styleHelper/appStyle";
import { LOADING_STOP, LOADING_START } from "../../context/actions/type";



const Dashboard = ({navigation}) => {
  const globalState = useContext(Store);
  const { dispatchLoaderAction } = globalState;

  const [userDetail, setUserDetail] = useState({
    id: "",
    name: "",
    profileImg: "",
  });
  const [getScrollPosition, setScrollPosition] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const { profileImg, name } = userDetail;
  useLayoutEffect( () => {
    navigation.setOptions({
      headerRight:()=>(
        <SimpleLineIcon 
        name="logout" 
        size={26} 
        color={color.WHITE}
        style={{right: 10}}
        onPress={ () => 
        Alert.alert(
          'Logout',
          'Are You Sure To Logout',
          [
            {
              text:'yes',
              onPress: () => logout(),
            },
            {
              text:'No',
            },
          ],
            {
              cancelable: false,
            },
          )
          }
        />


      ),
    });
  }, [navigation]);

  // * LOG OUT
  const logout = () => {
    LogOutUser()
      .then(() => {
        clearAsyncStorage()
          .then(() => {
            navigation.replace("Login");
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => alert(err));
  };

  // * ON IMAGE TAP
  const imgTap = (profileImg, name) => {
    if (!profileImg) {
      navigation.navigate("ShowFullImg", {
        name,
        imgText: name.charAt(0),
      });
    } else {
      navigation.navigate("ShowFullImg", { name, img: profileImg });
    }
  };

  // * ON NAME TAP
  const nameTap = (profileImg, name, guestUserId) => {
    if (!profileImg) {
      navigation.navigate("Chat", {
        name,
        imgText: name.charAt(0),
        guestUserId,
        currentUserId: uuid,
      });
    } else {
      navigation.navigate("Chat", {
        name,
        img: profileImg,
        guestUserId,
        currentUserId: uuid,
      });
    }
  };


  useEffect(() => {
    setTimeout(() => { dispatchLoaderAction({
      type: LOADING_START,}, 2000);
    });
    try {
      firebase
        .database()
        .ref("users")
        .on("value", (dataSnapshot) => {
          let users = [];
          let currentUser = {
            id: "",
            name: "",
            profileImg: "",
          };
          dataSnapshot.forEach((child) => {
            if (uuid === child.val().uuid) {
              currentUser.id = uuid;
              currentUser.name = child.val().name;
              currentUser.profileImg = child.val().profileImg;
            } else {
              users.push({
                id: child.val().uuid,
                name: child.val().name,
                profileImg: child.val().profileImg,
              });
            }
          });
          setUserDetail(currentUser);
          setAllUsers(users);
          dispatchLoaderAction({
            type: LOADING_STOP,
          });
        });
    } catch (error) {
      alert(error);
      dispatchLoaderAction({
        type: LOADING_STOP,
      });
    }
  }, []);

  const selectPhotoTapped = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled photo picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        // Base 64 image:
        let source = "data:image/jpeg;base64," + response.data;
        dispatchLoaderAction({
          type: LOADING_START,
        });
        UpdateUser(uuid, source)
          .then(() => {
            setUserDetail({
              ...userDetail,
              profileImg: source,
            });
            dispatchLoaderAction({
              type: LOADING_STOP,
            });
          })
          .catch(() => {
            alert(err);
            dispatchLoaderAction({
              type: LOADING_STOP,
            });
          });
      }
    });
  };

  const getOpacity = () => {
    if (deviceHeight < smallDeviceHeight) {
      return deviceHeight / 4;
    } else {
      return deviceHeight / 6;
    }
  };


 
    return( 
      <SafeAreaView style={{ flex: 1, backgroundColor: color.BLACK }}>
      {getScrollPosition > getOpacity() && (
        <StickyHeader
          name={name}
          img={profileImg}
          onImgTap={() => imgTap(profileImg, name)}
        />
      )}

      {/* ALL USERS */}
      <FlatList
        alwaysBounceVertical={false}
        data={allUsers}
        keyExtractor={(_, index) => index.toString()}
        onScroll={(event) =>
          setScrollPosition(event.nativeEvent.contentOffset.y)
        }
        ListHeaderComponent={
          <View
            style={{
              opacity:
                getScrollPosition < getOpacity()
                  ? (getOpacity() - getScrollPosition) / 100
                  : 0,
            }}
          >
            <Profile
              img={profileImg}
              onImgTap={() => imgTap(profileImg, name)}
              onEditImgTap={() => selectPhotoTapped()}
              name={name}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ShowUsers
            name={item.name}
            img={item.profileImg}
            onImgTap={() => imgTap(item.profileImg, item.name)}
            onNameTap={() => nameTap(item.profileImg, item.name, item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
};


export default Dashboard;
