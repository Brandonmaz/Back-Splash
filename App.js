import React from 'react';
import { View, ActivityIndicator, FlatList, Dimensions, Image, Animated, TouchableWithoutFeedback, TouchableOpacity, Share, ScrollView } from 'react-native'
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import axios from 'axios'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const {height, width} = Dimensions.get('window')
const scrollYPos = 0

export default class App extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      isLoading : true,
      images:[],
      scroll: false,
      isLiked: false,
      scale: new Animated.Value(1),
      isImagedFocused: false,
    }
    this.scale = {
      transform: [{scale:this.state.scale}]
    }
    this.bottomMenu = this.state.scale.interpolate({
      inputRange: [0.87, 1],
      outputRange: [0, -80]
    })
    this.borderRadius = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [30, 0]
    })
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
  
  saveToAllPhotos = async (image)=>{
    let cameraPermissions = await Permissions.getAsync
    (Permissions.MEDIA_LIBRARY)
    if(cameraPermissions.status !== 'granted'){
      cameraPermissions = await Permissions.askAsync
      (Permissions.MEDIA_LIBRARY)
    }
    if(cameraPermissions.status === 'granted'){
      FileSystem.downloadAsync(image.urls.regular, FileSystem.documentDirectory+image.id+'.jpg').then(({uri})=>{
        MediaLibrary.saveToLibraryAsync(uri)
        alert('Saved to photos')
      }).catch(error=>{
        console.log(error)
      })
    } else {
      alert('Requires camera roll permission')
    }
  }

  showControls = (item) => {
    this.setState((state) => ({
      isImagedFocused:!state.isImagedFocused
    }), () => {
      if(this.state.isImagedFocused){
        Animated.spring(this.state.scale,{
          toValue:0.85,
          useNativeDriver: false
        }).start()
      } else {
        Animated.spring(this.state.scale,{
          toValue: 1,
          useNativeDriver: false
        }).start()
      }
    })
  }
  shareWallpaper = async (image) => {
    try{
      await Share.share({
        message:'Checkout this wallpaper '+image.urls.full
      })
    } catch(error){
      console.log(error)
    }
  }
  onLikePress = () => {
      this.setState({
        isLiked: !this.state.isLiked
      })
    }
   refreshToTop = () => {
    this.scroll.scrollTo({x: 0, y: 0, animated: true});
  };
  
  renderItem = ({item}) => {
    return (
      <ScrollView ref={(scroll) => {this.scroll = scroll}}>
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
            <Animated.Image
              style={{
                flex: 1, 
                height: null, 
                width: null,
                borderRadius: this.borderRadius
              }}
              source= {{uri: item.urls.regular}}
              // source={{uri: item.location}}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View 
          style={{
            position:'absolute',
            left: 0,
            right: 0,
            bottom: this.bottomMenu,
            height: 80,
            flexDirection:'row',
            justifyContent: 'space-around'
          }}>
        <View 
          style={{
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => {this.loadWallpapers(); this.refreshToTop()}}>
              <MaterialCommunityIcons name={"refresh"} color={'ghostwhite'} size={35}/>
          </TouchableOpacity>
        </View>
        <View 
          style={{
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
          <TouchableOpacity activeOpacity={0.5} onPress={() =>  {this.saveToAllPhotos(item); this.onLikePress()}} >
              <MaterialCommunityIcons name={"heart-plus"} size={65} color={this.state.isLiked ? 'red' : 'red'} />
          </TouchableOpacity>
        </View>
         <View 
          style={{
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
          <TouchableOpacity activeOpacity={0.5} onPress={() => this.shareWallpaper(item)}>
            <FontAwesome name={"slideshare"} color="ghostwhite" size={30}/>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </View>
    </ScrollView>
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
        scrollEnabled={!this.state.isImagedFocused}
        vertical
        pagingEnabled
        data={this.state.images}
        renderItem={this.renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  }
}
// Access Key
// qoq6NUdLxF7YpT92ANivmEylYgk8vYUtmFgLaVupxBs

// Secret Key
// VkrTTVWLwID056AO_0eSQ-zD6_PlLdwcV_SoqGNnLNQ