import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Amplify, Auth } from "aws-amplify";
import { useEffect, useState } from "react";
Amplify.configure({
  Auth: {
    region: "us-west-2",
    userPoolId: "us-west-2_TX5cKB72K",
    userPoolWebClientId: "62e0a5leae3kejbd6kleog6pj2",
  },
});
export default function App() {
  const NOTSIGNIN = "You are NOT logged in";
  const SIGNEDIN = "You have logged in successfully";
  const SIGNEDOUT = "You have logged out successfully";
  const WAITINGFOROTP = "Enter OTP number";
  const VERIFYNUMBER = "Verifying email";

  const [message, setMessage] = useState("Welcome to Demo");
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const password = Math.random().toString(10) + "Abc#";

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = () => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
        setMessage(SIGNEDIN);
        setSession(null);
      })
      .catch((err) => {
        console.error(err);
        setMessage(NOTSIGNIN);
      });
  };
  const signOut = () => {
    if (user) {
      Auth.signOut();
      setUser(null);
      setOtp("");
      setMessage(SIGNEDOUT);
    } else {
      setMessage(NOTSIGNIN);
    }
  };
  const signIn = () => {
    setMessage(VERIFYNUMBER);
    Auth.signIn(email)
      .then((result) => {
        console.log(result);
        setSession(result);
        setMessage(WAITINGFOROTP);
      })
      .catch((e) => {
        console.log(e, "oooo");
        if (e.code === "UserNotFoundException") {
          signUp();
        } else if (e.code === "UsernameExistsException") {
          setMessage(WAITINGFOROTP);
          signIn();
        } else {
          console.log(e.code);
          console.error(e);
        }
      });
  };
  const signUp = async () => {
    const result = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
      },
    }).then(() => signIn());
    return result;
  };
  const verifyOtp = () => {
    Auth.sendCustomChallengeAnswer(session, otp)
      .then(async (user) => {
        try {
          await Auth.currentSession();
          setUser(user);
          setMessage(SIGNEDIN);
          setSession(null);
        } catch {
          console.log("Apparently the user did not enter the right code");
        }
      })
      .catch((err) => {
        console.log(err);
        setMessage(err.message);
        setOtp("");
        console.log(err);
      });
  };

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      {!user && !session && (
        <View style={styles.wrapper}>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
          />
          <Button onPress={signIn} title="GET OTP" />
        </View>
      )}
      {!user && session && (
        <View style={styles.wrapper}>
          <TextInput
            onChangeText={(text) => setOtp(text)}
            style={styles.input}
          />
          <Button onPress={verifyOtp} title="Confirm OTP" />
        </View>
      )}
      <Button onPress={verifyAuth} title="Am I signin" />
      <Button onPress={signOut} title="Signout" />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 48,
    width: "90%",
    borderWidth: 1,
    borderColor: "#c4c4c4",
    borderRadius: 5,
  },
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
