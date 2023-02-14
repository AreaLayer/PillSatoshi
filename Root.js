import { View } from "react-native";
import React from "react";
import { getValue } from "./utils/secureStore";
import { useState, useCallback, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useSelector, useDispatch } from "react-redux";
import { logIn } from "./features/authSlice";
import UnauthedNavigator from "./nav/UnauthedNavigator";
import { loadAsync } from "expo-font";
import AuthedNavigator from "./nav/AuthedNavigator";
import { loginToWallet } from "./utils/wallet";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { hydrateFromDatabase, init } from "./utils/database";
import { getPublicKey } from "nostr-tools";
import { initRelays } from "./utils/nostrV2";
import { updateFollowedUsers } from "./utils/nostrV2/getUserData";
import { hydrateStore } from "./utils/cache/asyncStorage";

SplashScreen.preventAutoHideAsync();

const Root = () => {
    const [appIsReady, setAppIsReady] = useState();
    const dispatch = useDispatch();
    const { isLoggedIn, walletExpires } = useSelector((state) => state.auth);

    useEffect(() => {
        const prepare = async () => {
            try {
                await initRelays();
                const privKey = await getValue("privKey");
                await loadAsync({
                    "Montserrat-Regular": require("./assets/Montserrat-Regular.ttf"),
                    "Montserrat-Bold": require("./assets/Montserrat-Bold.ttf"),
                    "Satoshi-Symbol": require("./assets/Satoshi-Symbol.ttf"),
                });
                if (privKey) {
                    console.log("Initialising from storage...");
                    const {data: {access_token, username}} = await loginToWallet(
                        privKey
                    );
                    const pubKey = await getPublicKey(privKey)
                    console.log(username)
                    dispatch(logIn({ bearer: access_token, username, pubKey }));
                }
                await init();
                await hydrateFromDatabase();
                await updateFollowedUsers();
                await hydrateStore();
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        };
        prepare();
    }, []);

    const onLayoutRootView = useCallback(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }
    return (
        <NavigationContainer
            onStateChange={async () => {
                if (isLoggedIn && new Date() > walletExpires) {
                    const privKey = await getValue("privKey");
                    const username = await getValue("username");
                    const { access_token } = loginToWallet(privKey, username);
                    dispatch(
                        logIn({ bearer: access_token, username: username })
                    );
                    console.log("Token refreshed");
                }
            }}
        >
            <StatusBar style="light" />
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                {isLoggedIn == false ? (
                    <UnauthedNavigator />
                ) : (
                    <AuthedNavigator />
                )}
            </View>
        </NavigationContainer>
    );
};

export default Root;
