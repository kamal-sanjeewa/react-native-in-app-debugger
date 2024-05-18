import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../Text';
import Highlight from '../Highlight';

export const MAX_URL_LENGTH = 100;

export default ({ item, filter }) => {
  const tabs = [
    { value: 'Response Body' },
    { value: 'Request Body', hide: !item.request.data },
    { value: 'Request Header' },
  ];
  const [tab, setTab] = useState(tabs[0].value);
  const hasResponse = item.response;
  const Tab = ({ value, hide }) => {
    if (hide) return null;
    const isSelected = value === tab;
    return (
      <TouchableOpacity
        activeOpacity={isSelected ? 1 : 0.7}
        onPress={() => setTab(value)}
        style={[styles.selectionTab, { backgroundColor: isSelected ? 'white' : undefined }]}
      >
        <Text
          style={{
            color: isSelected ? '#000' : '#ffffff88',
            textAlign: 'center',
          }}
        >
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {item.request.url.length > MAX_URL_LENGTH && (
        <Text style={{ color: '#ffffff99', paddingVertical: 20 }}>
          <Highlight text={item.request.url} filter={filter} />
        </Text>
      )}
      <View>
        <View style={{ flexDirection: 'row' }}>
          {tabs.map((t) => (
            <Tab key={t.value} {...t} />
          ))}
        </View>

        {tab === tabs[0].value && hasResponse && (
          <Text style={{ color: 'white' }}>
            <Highlight text={JSON.stringify(item.response.data, undefined, 4)} filter={filter} />
          </Text>
        )}
        {tab === tabs[1].value && (
          <Text style={{ color: 'white' }}>
            <Highlight text={JSON.stringify(item.request.data, undefined, 4)} filter={filter} />
          </Text>
        )}
        {tab === tabs[2].value && (
          <Text style={{ color: 'white' }}>
            <Highlight text={JSON.stringify(item.request.headers, undefined, 4)} filter={filter} />
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    backgroundColor: '#171717',
    paddingTop: 10,
    paddingBottom: 40,
  },
  selectionTab: {
    borderBottomColor: 'white',
    borderBottomWidth: 2,
    flex: 1,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
  },
});
