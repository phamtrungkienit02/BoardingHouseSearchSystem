import { useContext, useEffect, useState } from "react";
import MyStyles from "../../styles/MyStyles";

import { ActivityIndicator, Button, List, Text } from "react-native-paper";
import { Image, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import APIs, { endpoints } from "../../configs/APIs";
import moment from "moment/moment";
import "moment/locale/vi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/Context";

const Post = ({navigation}) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const user = useContext(MyUserContext);

    const loadPosts = async () => {
        if (page > 0) {
            setLoading(true);
            try {
                // console.info(page);
                let url = `${endpoints['posts']}?page=${page}`;  
                let res = await APIs.get(url);
                
    
                if (page === 1)
                    setPosts(res.data.results);
                else  
                    setPosts(current => {
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

    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            setPage(page+1);
        }
    }

    const goPostDetail = (postId) => {
        navigation.navigate('PostDetail', {'postId': postId});
        
    }
    const goNewPost = () => {
        navigation.navigate('NewPost');
        
    }


    useEffect(() => {
        loadPosts();
    }, [page])

    return (
        <View style={MyStyles.container}>   
        <View style={[MyStyles.row, {justifyContent: "flex-end"}]}>
            {user && <Button style={MyStyles.margin} onPress={goNewPost} textColor="white" buttonColor='blue' icon="post">Bài viết mới</Button>}
        </View>

        <ScrollView onScroll={loadMore}>
            <RefreshControl onRefresh={() => loadPosts()} />
            {loading && <ActivityIndicator />}
            {Array.isArray(posts) && posts.map(p => 
                <TouchableOpacity key={p.id} onPress={() => goPostDetail(p.id)}>
                     <List.Item  style={MyStyles.margin}  
                                title={p.title} description={moment(p.created_date).fromNow()}  
                                left={() => <Image style={MyStyles.avatar} source={{uri: p.user.avatar}}/>}  
                                right={() => <Text>{p.district.name}</Text> }/>
                </TouchableOpacity>   
           )}
            {loading && page > 1 && <ActivityIndicator />}
        </ScrollView>
    </View>
    );
}

export default Post;