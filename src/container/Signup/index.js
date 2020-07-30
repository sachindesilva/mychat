import React, { useContext, useState } from "react";
import {
  Text,
  SafeAreaView,
  View,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { InputField, RoundCornerButton, Logo } from "../../component";
import { globalStyle, color } from "../../utility";
import { Store } from "../../context/store";
import { LOADING_START, LOADING_STOP } from "../../context/actions/type";
import { SignUpRequest ,AddUser} from "../../network";
import { setAsyncStorage, keys } from "../../asyncStorage"; 
import {setUniqueValue,keyboardVerticalOffset} from "../../utility/constants";
import firebase from "../../firebase/config";



const Signup = ({navigation }) => {
  const globalState = useContext(Store);
  const { dispatchLoaderAction } = globalState;
  
  const [credential, setCredential] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword:'',
  });
  const [logo, toggleLogo] = useState(true);
  const { name, email, password, confirmPassword } = credential;
  const setInitialState = () => {
    setCredential({ email: "", password: "", confirmPassword: "" });
  };

  onSignupPress = () =>{
    if (!name) {
      alert('Name is reqired');
    }
    else if (!email) {
      alert('email is reqired');
    }else if (!password){
      alert('password is reqired');
    }else if (password !== confirmPassword) {
      alert('password Did Not Match');
    }else {
      dispatchLoaderAction({
        type: LOADING_START,
      });
      SignUpRequest(email, password)
        .then((res) => {
          if (!res.additionalUserInfo) {
            dispatchLoaderAction({
              type: LOADING_STOP,
            });
            alert(res);
            return;
          }
          
          let uid = firebase.auth().currentUser.uid;
          let profileImg = '';
          AddUser(name, email, uid, profileImg)
            .then(() => {
              setAsyncStorage(keys.uuid, uid);
              setUniqueValue(uid);
              dispatchLoaderAction({
                type: LOADING_STOP,
              });
              navigation.navigate("Dashboard");
            })
            .catch((err) => {
              dispatchLoaderAction({
                type: LOADING_STOP,
              });
              alert(err);
            });
        })
        .catch((err) => {
          dispatchLoaderAction({
            type: LOADING_STOP,
          });
          alert(err);
        });
      }

  };

  const handleOnChange = (name, value) => {
    setCredential({
      ...credential,
      [name]: value,
    });
  
  };
  const handleFocus = () => {
    setTimeout(() => {
      toggleLogo(false);
    }, 200);
  };
  const handleBlur = () => {
    setTimeout(() => {
      toggleLogo(true);
    }, 200);
  };



 
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      style={[globalStyle.flex1, { backgroundColor: color.BLACK }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={{ flex: 1, backgroundColor: color.BLACK }}>
          {logo && (
            <View style={[globalStyle.containerCentered]}>
              <Logo />
            </View>
          )}
            <View style={[globalStyle.flex2, globalStyle.sectionCentered]}>
            <InputField
              placeholder="Enter name"
              value={name}
              onChangeText={(text) => handleOnChange("name", text)}
              />

            <InputField
              placeholder="Enter email"
              value={email}
              onChangeText={(text) => handleOnChange("email", text)}
              />

            <InputField
              placeholder="Enter password"
              value={password}
              secureTextEntry={true}
              onChangeText={(text) => handleOnChange("password", text)}
              />

             <InputField
              placeholder="Confirm Password"
              value={confirmPassword}
              secureTextEntry={true}
              onChangeText={(text) => handleOnChange("confirmPassword", text)}
              />
          <RoundCornerButton title="Signup" onPress={() => onSignupPress()} />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: color.LIGHT_GREEN,
              }}
              onPress={() => {
                setInitialState();
                navigation.navigate("Login");}}>
              Login
              </Text>
              </View>
              </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        );
      
            };
            export default Signup;
  
            
         
     