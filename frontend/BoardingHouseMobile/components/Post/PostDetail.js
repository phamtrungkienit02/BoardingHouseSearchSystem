import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Button, Card, List, Text, TextInput } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { Image, RefreshControl, ScrollView, View } from "react-native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import moment from "moment/moment";
import "moment/locale/vi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/Context";
import { useNavigation } from "@react-navigation/native";

const PostDetail = ({route}) => {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const postId = route.params?.postId;
    const [page, setPage] = useState(1);


    const nav = useNavigation();
    const user = useContext(MyUserContext);

    

    
    const loadPost = async () => {
        try {
            let res = await APIs.get(endpoints['post-details'](postId));
            setPost(res.data); 
        } catch (ex) {
            console.error(ex);
        }
    }
    const loadComments = async () => {
        if (page > 0) {
            setLoading(true);
            try {
                let url = `${endpoints['post_comments'](postId)}?page=${page}`;
                
                let res = await APIs.get(url);
                // let res = await APIs.get(endpoints['room_comments'](roomId)?page=${page});

                if (page === 1)
                    setComments(res.data.results);
                else  
                    setComments(current => {
                        return [...current, ...res.data.results];
                    });

            
                if (res.data.next === null)
                    setPage(0);
                // if (res.data.next === null) {
                //     setPage(0); // No more data to load
                //   } else {
                //     setPage(page + 1); // Increment page for next load
                //   }
            } catch (ex) {
                console.error(ex);
            }  finally {
                setLoading(false);
            }
        }
    }

    const sendComment = async () => {
   
        // setErr(false);
        // setLoading(true);
        try {
            // let form = new FormData();
            const token = await AsyncStorage.getItem('token');
            
            let res = await authApi(token).post(endpoints['add_comments_post'](postId),{
                // ...content
                'content': content

            });
            
            if (res.status === 201){
                setTimeout(async () => {
                    nav.navigate("Post");
                }, 1000);
            }
                

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    
    }

    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            // console.info(Math.random());
            setPage(page+1);
        }
    }
    

    useEffect(() => {
        loadPost();
    }, [postId])

    useEffect(() => {
        loadComments();
    }, [content, page])

    return(
        <View style={MyStyles.container}>
        <ScrollView onScroll={loadMore}>
            {post===null?<ActivityIndicator />:<>
                <Card>
                    <Card.Content>
                        <Text variant="titleLarge">{post.title}</Text>
                        <Text variant="bodyMedium">{post.description}</Text>
                    </Card.Content>
                </Card>

               
            </>}
           
            <View>
                    <TextInput style={MyStyles.margin} multiline={true} label="Nội dung bình luận..." value={content} onChangeText={setContent}  />
                    <View style={[MyStyles.row, {justifyContent: "flex-end"}]}>
                       {user && <Button onPress={sendComment} style={MyStyles.margin} textColor="white" buttonColor='blue' icon="comment">Thêm bình luận</Button>}
                    </View>
            </View>
          

            <View>
                    <RefreshControl onRefresh={() => loadRooms()} />
                    {loading && <ActivityIndicator />}
                    {/* {comments===null?<ActivityIndicator />:<> */}
                    {/* </>}  */}
                    {/* {comments && <> */}
                        {Array.isArray(comments) && comments.map(c => 
                            

                                
                                <List.Item key={c.id}
                                    title={c.user.last_name +" "+ c.user.first_name}
                                    description={c.content}
                                    left={() => <Image source={{uri: c.user.avatar}} style={MyStyles.avatar} />}
                                    right={() => <Text>{moment(c.created_date).fromNow()}</Text>}
                                />
                        )} 
                    {/* </>} */}
                   
                </View>
                {loading && page > 1 && <ActivityIndicator />}
        </ScrollView>
    </View>  
    );
}

export default PostDetail;