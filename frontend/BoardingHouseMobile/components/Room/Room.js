import { useContext, useEffect, useState } from "react"
import MyStyles from "../../styles/MyStyles"
import {View, Text, Image, ScrollView, RefreshControl } from "react-native"
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Button, Chip, List, Searchbar,  } from "react-native-paper";
import moment from "moment/moment";
import "moment/locale/vi";
import { TouchableOpacity } from "react-native-gesture-handler";
import { isCloseToBottom } from "../../configs/Utils";
import { MyUserContext } from "../../configs/Context";



const Room = ({navigation}) => {
    const [categories, setCategories] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [cateId, setCateId] = useState("");
    const [page, setPage] = useState(1);
    // const nav = useNavigation();

    const user = useContext(MyUserContext);
    const [owner, setOwner] = useState(false);

    const loadOwner =  async () => {
        if (user.role == "OWNER" || user.role == "ADMIN")
            setOwner(true)
        else 
            setOwner(false)
            
    }


    const loadCates = async () => {
        try {
            let res = await APIs.get(endpoints['categories'])
            setCategories(res.data)
        } catch (ex) {
            console.error(ex)
        }
    }
    const loadRooms = async () => {
        if (page > 0) {
            setLoading(true);
            try {
                // console.info(page);
                let url = `${endpoints['rooms']}?q=${q}&cate_id=${cateId}&page=${page}`;
                
                let res = await APIs.get(url);
    
                if (page === 1)
                    setRooms(res.data.results);
                else  
                    setRooms(current => {
                        return [...current, ...res.data.results];
                    });
                
                if (res.data.next === null)
                    setPage(0);
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        loadCates();
    }, [])

    useEffect(() => {
        loadRooms();
    }, [q, cateId, page])

    useEffect(() => {
        loadOwner();
    },[user])


    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            // console.info(Math.random());
            setPage(page+1);
        }
    }

    const goRoomDetail = (roomId) => {
        navigation.navigate('RoomDetail', {'roomId': roomId});
        
    }

    const search = (value, callback) => {
        setPage(1);
        callback(value)
    }

    const goNewRoom = () => {
        navigation.navigate('NewRoom');
        
    }

    return (
        <View style={MyStyles.container}>
        <View style={[MyStyles.row, {justifyContent: "flex-end"}]}>
            {user && owner && <Button style={MyStyles.margin} onPress={goNewRoom} textColor="white" buttonColor='blue' icon="home">Đăng tin cho thuê trọ</Button>}
        </View>
            <View style={[MyStyles.row, MyStyles.wrap]}>
                <Chip mode={!cateId?"outlined":"flat"} onPress={() => search("", setCateId)} style={MyStyles.margin} icon="shape">Trang chủ</Chip>
                {categories===null?<ActivityIndicator/>:<>      
                    {Array.isArray(categories) && categories.map(c => 
                        <Chip mode={c.id===cateId?"outlined":"flat"} onPress={() => search(c.id, setCateId)}
                            style={MyStyles.margin} key={c.id} icon="shape">
                            {c.name}
                        </Chip>)}
                </>}
            </View>

            <View>
                <Searchbar placeholder="Nhập tiêu đề bài viết..." onChangeText={(t) => search(t, setQ)} value={q} />
                
            </View>
            
            <ScrollView onScroll={loadMore}>
                <RefreshControl onRefresh={() => loadRooms()} />
                {loading && <ActivityIndicator />}
                {Array.isArray(rooms) && rooms.map(r => 
                    <TouchableOpacity key={r.id} onPress={() => goRoomDetail(r.id)}>
                        {/* <List.Subheader>Some title</List.Subheader> */}
                         <List.Item  style={MyStyles.margin}  
                                    //  title={r.district.name} description= {r.price}
                                    
                                    left={() => <Image style={MyStyles.image} source={{uri: r.images[0].image}}/>}  
                                    right={() => <View style={MyStyles.m10}>
                                            <Text>{moment(r.created_date).fromNow()}</Text>
                                            <Text>{r.district.name}</Text>
                                            <Text>{r.price}</Text>
                            
                                            </View> }/>
                    </TouchableOpacity>   
               )}
                {loading && page > 1 && <ActivityIndicator />}
            </ScrollView>
        </View>
    )
}
export default Room;