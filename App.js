import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList, Dimensions, Image, Animated, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios'

const {height, width} = Dimensions.get('window')

export default class App extends React.Component {

  constructor(){
    super()
    this.state = {
      isLoading : true,
      images:[],
      scale: new Animated.Value(1),
      useNativeDriver: false,
    }
    this.scale = {
      transform: [{scale:this.state.scale}]
    }
  }

  loadWallpapers = () => {
    axios.get('https://api.unsplash.com/photos/random?count=30&client_id=qoq6NUdLxF7YpT92ANivmEylYgk8vYUtmFgLaVupxBs')
    .then(
      function(response){
        console.log(response.data)
        this.setState({images:response.data, isLoading:false})
      }.bind(this)
    )
    .catch(function(error){
      console.log(error)
    })
    .finally(function(){
      console.log('request completed')
    })
  }

  componentDidMount(){
    this.loadWallpapers()
  }

  showControls = (item) => {
    this.setState((state) => ({
      useNativeDriver:!state.useNativeDriver
    }), () => {
      if(this.state.useNativeDriver){
        Animated.spring(this.state.scale,{
          toValue:0.9,
          useNativeDriver: true
        }).start()
      } else {
        Animated.spring(this.state.scale,{
          toValue: 1,
          useNativeDriver: true
        }).start()
      }
    })
  }
  renderItem = ({item}) => {
    return (
      <View style={{flex: 1}}>
        <View
          style={{
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
        <ActivityIndicator size="large" color="grey"/>
        </View>
        <TouchableWithoutFeedback onPress = {()=> this.showControls(item)}>
          <Animated.View style={[{height, width}, this.scale]}>
            <Image
              style={{flex: 1, height: null, width: null}}
              source= {{uri: item.urls.regular}}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
  render() {
    return  this.state.isLoading ? (
      <View 
        style= {{
          flex: 1, 
          backgroundColor: 'black', 
          alignItems: 'center', 
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="grey"/>
      </View>
    ) :
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <FlatList
        horizontal
        pagingEnabled
        data={this.state.images}
        renderItem={this.renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Access Key
// qoq6NUdLxF7YpT92ANivmEylYgk8vYUtmFgLaVupxBs

// Secret Key
// VkrTTVWLwID056AO_0eSQ-zD6_PlLdwcV_SoqGNnLNQ