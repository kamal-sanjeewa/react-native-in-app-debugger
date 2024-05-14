import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Text from "./Text";
let DeviceInfo;
try {
  DeviceInfo = require("react-native-device-info");
} catch (error) {
  // console.error("Error importing DeviceInfo:", error);
}

import useAnimation from "./useAnimation";
import Variables from "./Variables";
import Api from "./Api";
import useApiInterceptor from "./useApiInterceptor";

const dimension = Dimensions.get("window");

let v = "";
let modelOs;
if (DeviceInfo) {
  let model = DeviceInfo.getDeviceId();
  if (model === "unknown") model = DeviceInfo.getModel();
  modelOs = model + " - " + DeviceInfo.getSystemVersion();
  const pcs = DeviceInfo.getReadableVersion().split(".");
  const lastPc = pcs.pop();
  v = pcs.join(".") + "-" + lastPc;
}

const Label = (props) => (
  <Text
    {...props}
    numberOfLines={1}
    ellipsizeMode="tail"
    style={[styles.label, props.style]}
  />
);

export default ({
  variables,
  env,
  version = v,
  maxNumOfApiToStore = 0,
  labels = [],
  interceptResponse
}) => {
  const { apis, clear } = useApiInterceptor(maxNumOfApiToStore, interceptResponse);

  const [tab, setTab] = useState("api");

  const errors = apis.filter((a) => a.response?.error).length;
  const numPendingApiCalls = apis.filter((a) => !a.response).length;
  let badgeHeight = 13;

  const displayLabels = [
    (!!env || !!version) && (env || "") + (env ? " " : "") + version,
    modelOs,
    ~~dimension.width + " x " + ~~dimension.height,
    variables?.GIT_BRANCH,
    variables?.BUILD_DATE_TIME,
    ...labels,
  ].filter(Boolean);

  displayLabels.forEach(() => (badgeHeight += 7));

  const {
    translateX,
    translateY,
    borderRadius,
    width,
    height,
    isOpen,
    panResponder,
    setIsOpen,
    shouldShowDetails,
  } = useAnimation(badgeHeight);
  return (
    <Animated.View
      style={{
        transform: [{ translateX }, { translateY }],
        position: "absolute",
        borderRadius,
        backgroundColor: "#000000" + (isOpen ? "ee" : "bb"),
        height,
        width,
        borderTopRightRadius: numPendingApiCalls || errors ? 0 : undefined,
      }}
      {...(isOpen ? {} : panResponder.panHandlers)}
    >
      {!shouldShowDetails ? (
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.box}
          activeOpacity={0.8}
        >
          <View style={styles.badgeContainer}>
            {!!numPendingApiCalls && (
              <View style={[styles.badge, { backgroundColor: "orange" }]}>
                <Text style={{ fontSize: 6, color: "white" }}>
                  {numPendingApiCalls}
                </Text>
              </View>
            )}
            {!!errors && (
              <View style={[styles.badge, { backgroundColor: "red" }]}>
                <Text style={{ fontSize: 6, color: "white" }}>{errors}</Text>
              </View>
            )}
          </View>
          {displayLabels.map((l) => (
            <Label key={l}>{l}</Label>
          ))}
        </TouchableOpacity>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.labelContainer}>
            {displayLabels.map((l) => (
              <Label key={l}>{l}</Label>
            ))}
          </View>
          <View style={{ flexDirection: "row", padding: 5 }}>
            <View style={{ flex: 1, flexDirection: "row" }}>
              {!!variables &&
                ["api", "variables"].map((t) => {
                  const isSelected = t === tab;
                  return (
                    <TouchableOpacity
                      onPress={() => setTab(t)}
                      activeOpacity={isSelected ? 1 : 0.7}
                      key={t}
                      style={{
                        flex: 1,
                        borderBottomWidth: +isSelected,
                        borderColor: "white",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          opacity: isSelected ? 1 : 0.5,
                          textAlign: "center",
                        }}
                      >
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.close}>X</Text>
            </TouchableOpacity>
          </View>
          {tab === "variables" && !!variables && (
            <Variables variables={variables} />
          )}
          {tab === "api" && (
            <Api
              apis={apis}
              clear={clear}
              maxNumOfApiToStore={maxNumOfApiToStore}
            />
          )}
        </SafeAreaView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  box: {
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  label: { color: "white", textAlign: "center", fontSize: 6 },
  badgeContainer: {
    gap: 3,
    flexDirection: "row",
    top: -10,
    right: -3,
    position: "absolute",
    zIndex: 999,
  },
  badge: {
    padding: 3,
    borderRadius: 999,
  },
  close: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  labelContainer: {
    backgroundColor: "black",
    flexDirection: "row",
    columnGap: 7,
    flexWrap: "wrap",
  },
});
