import React, {useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Alert, ScrollView} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {Ionicons} from '@expo/vector-icons';

const BLUE = '#126BFF';

const seedProducts = [
  {id:'1', name:'Digital Product', category:'Featured', description:'A sample product for your Prologs store.', price:'₦0', available:true},
  {id:'2', name:'Premium Service', category:'Services', description:'Replace this with your own product or service.', price:'₦0', available:true},
  {id:'3', name:'New Item', category:'New', description:'Add your real inventory from the admin dashboard.', price:'₦0', available:true},
];

function Home({navigation, products}) {
  const [query,setQuery]=useState('');
  const filtered=products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  return <SafeAreaView style={s.safe}>
    <StatusBar style="dark"/>
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.logo}>PROLOGS</Text>
          <Text style={s.sub}>Your digital marketplace</Text>
        </View>
        <TouchableOpacity onPress={()=>navigation.navigate('Cart')} style={s.iconBtn}>
          <Ionicons name="cart-outline" size={25} color={BLUE}/>
        </TouchableOpacity>
      </View>
      <View style={s.search}>
        <Ionicons name="search" size={20} color="#7A8799"/>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search products..." style={s.searchInput}/>
      </View>
      <View style={s.hero}>
        <Text style={s.heroTitle}>Shop smarter.</Text>
        <Text style={s.heroText}>Discover products and services from Prologs.</Text>
        <TouchableOpacity style={s.heroBtn} onPress={()=>navigation.navigate('Products')}>
          <Text style={s.heroBtnText}>Browse products</Text>
        </TouchableOpacity>
      </View>
      <Text style={s.section}>Featured</Text>
      <FlatList data={filtered.slice(0,4)} scrollEnabled={false} keyExtractor={x=>x.id}
        renderItem={({item})=><ProductCard item={item} onPress={()=>navigation.navigate('Product',{item})}/>} />
    </ScrollView>
  </SafeAreaView>
}

function ProductCard({item,onPress}) {
 return <TouchableOpacity style={s.card} onPress={onPress}>
   <View style={s.productIcon}><Ionicons name="cube-outline" size={32} color={BLUE}/></View>
   <View style={{flex:1}}>
     <Text style={s.cardTitle}>{item.name}</Text>
     <Text style={s.muted}>{item.category}</Text>
     <Text style={s.price}>{item.price}</Text>
   </View>
   <Ionicons name="chevron-forward" size={22} color="#9AA7B8"/>
 </TouchableOpacity>
}

function Products({navigation,products}) {
 return <SafeAreaView style={s.safe}><StatusBar style="dark"/>
   <View style={s.page}><Text style={s.pageTitle}>Products</Text>
   <FlatList data={products} keyExtractor={x=>x.id} renderItem={({item})=><ProductCard item={item} onPress={()=>navigation.navigate('Product',{item})}/>} />
   </View>
 </SafeAreaView>
}

function Product({route,navigation}) {
 const {item}=route.params;
 return <SafeAreaView style={s.safe}><StatusBar style="dark"/>
  <ScrollView contentContainerStyle={s.page}>
   <TouchableOpacity onPress={()=>navigation.goBack()}><Ionicons name="arrow-back" size={26} color="#172033"/></TouchableOpacity>
   <View style={s.bigIcon}><Ionicons name="cube-outline" size={70} color={BLUE}/></View>
   <Text style={s.pageTitle}>{item.name}</Text>
   <Text style={s.muted}>{item.category}</Text>
   <Text style={s.description}>{item.description}</Text>
   <Text style={s.bigPrice}>{item.price}</Text>
   <TouchableOpacity style={s.primary} onPress={()=>Alert.alert('Added to cart','This starter app is ready for the real cart/backend to be connected.')}>
     <Text style={s.primaryText}>Add to cart</Text>
   </TouchableOpacity>
  </ScrollView>
 </SafeAreaView>
}

function Cart() {
 return <SafeAreaView style={s.safe}><StatusBar style="dark"/><View style={s.empty}>
   <Ionicons name="cart-outline" size={65} color={BLUE}/><Text style={s.emptyTitle}>Your cart is empty</Text>
   <Text style={s.muted}>Products you add will appear here.</Text>
 </View></SafeAreaView>
}

function Account({navigation}) {
 return <SafeAreaView style={s.safe}><StatusBar style="dark"/><View style={s.page}>
  <Text style={s.pageTitle}>Account</Text>
  <View style={s.accountBox}><Ionicons name="person-circle-outline" size={58} color={BLUE}/><Text style={s.cardTitle}>Welcome to Prologs</Text><Text style={s.muted}>Sign in to manage your orders.</Text></View>
  <TouchableOpacity style={s.primary} onPress={()=>navigation.navigate('Login')}><Text style={s.primaryText}>Sign in</Text></TouchableOpacity>
 </View></SafeAreaView>
}

function Login() {
 return <SafeAreaView style={s.safe}><StatusBar style="dark"/><View style={s.page}>
  <Text style={s.logo}>PROLOGS</Text><Text style={s.pageTitle}>Sign in</Text>
  <TextInput placeholder="Username or email" style={s.input}/><TextInput placeholder="Password" secureTextEntry style={s.input}/>
  <TouchableOpacity style={s.primary} onPress={()=>Alert.alert('Coming next','Real authentication will be connected to the backend in the next stage.')}><Text style={s.primaryText}>Sign in</Text></TouchableOpacity>
 </View></SafeAreaView>
}

export default function App(){
 const [products,setProducts]=useState(seedProducts);
 return <Navigation products={products} setProducts={setProducts}/>;
}

function Navigation({products,setProducts}){
 const {NavigationContainer}=require('@react-navigation/native');
 const {createNativeStackNavigator}=require('@react-navigation/native-stack');
 const Stack=createNativeStackNavigator();
 return <NavigationContainer><Stack.Navigator screenOptions={{headerShown:false}}>
  <Stack.Screen name="Home">{p=><Home {...p} products={products}/>}</Stack.Screen>
  <Stack.Screen name="Products">{p=><Products {...p} products={products}/>}</Stack.Screen>
  <Stack.Screen name="Product" component={Product}/>
  <Stack.Screen name="Cart" component={Cart}/>
  <Stack.Screen name="Account" component={Account}/>
  <Stack.Screen name="Login" component={Login}/>
 </Stack.Navigator></NavigationContainer>
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:'#fff'},container:{padding:20,paddingBottom:40},page:{flex:1,padding:20},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
 logo:{fontSize:24,fontWeight:'900',letterSpacing:2,color:BLUE},sub:{color:'#7A8799',marginTop:3},iconBtn:{padding:10,borderWidth:1,borderColor:'#E5EAF2',borderRadius:14},
 search:{height:52,borderRadius:15,backgroundColor:'#F4F7FB',flexDirection:'row',alignItems:'center',paddingHorizontal:15,marginBottom:18},searchInput:{flex:1,marginLeft:8,fontSize:16},
 hero:{backgroundColor:'#EAF2FF',borderRadius:22,padding:22,marginBottom:25},heroTitle:{fontSize:30,fontWeight:'800',color:'#12213A'},heroText:{color:'#536276',fontSize:15,marginTop:7,lineHeight:21},heroBtn:{alignSelf:'flex-start',marginTop:16,backgroundColor:BLUE,paddingHorizontal:18,paddingVertical:11,borderRadius:12},heroBtnText:{color:'#fff',fontWeight:'700'},
 section:{fontSize:21,fontWeight:'800',marginBottom:12,color:'#172033'},card:{flexDirection:'row',alignItems:'center',padding:14,borderWidth:1,borderColor:'#E8EDF5',borderRadius:18,marginBottom:12,backgroundColor:'#fff'},productIcon:{width:62,height:62,borderRadius:16,backgroundColor:'#EEF4FF',alignItems:'center',justifyContent:'center',marginRight:14},cardTitle:{fontSize:17,fontWeight:'750',color:'#172033'},muted:{color:'#7A8799',marginTop:3},price:{color:BLUE,fontWeight:'800',marginTop:7},pageTitle:{fontSize:30,fontWeight:'850',color:'#172033',marginVertical:18},bigIcon:{height:220,borderRadius:25,backgroundColor:'#EEF4FF',alignItems:'center',justifyContent:'center'},description:{fontSize:16,color:'#536276',lineHeight:24,marginTop:18},bigPrice:{fontSize:28,fontWeight:'900',color:BLUE,marginVertical:20},primary:{backgroundColor:BLUE,padding:16,borderRadius:15,alignItems:'center',marginTop:12},primaryText:{color:'#fff',fontSize:17,fontWeight:'800'},input:{borderWidth:1,borderColor:'#DDE4EE',borderRadius:14,padding:15,fontSize:16,marginBottom:12},empty:{flex:1,alignItems:'center',justifyContent:'center',padding:30},emptyTitle:{fontSize:24,fontWeight:'800',marginTop:15,color:'#172033'},accountBox:{padding:22,borderWidth:1,borderColor:'#E8EDF5',borderRadius:20,alignItems:'center'}
});
