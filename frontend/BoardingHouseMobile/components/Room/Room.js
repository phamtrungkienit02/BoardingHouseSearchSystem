import { useEffect, useState } from "react"
import MyStyles from "../../styles/MyStyles"
import {View, Text, Image, ScrollView } from "react-native"
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Chip, List, Searchbar,  } from "react-native-paper";
// import moment from "moment/moment";


const Room = () => {
    const [categories, setCategories] = useState();
    const [courses, setCourses] = useState();
    const [loading, setLoading] = useState(false);

    const loadCates = async () => {
        try {
            let res = await APIs.get(endpoints['categories'])
            setCategories(res.data)
        } catch (ex) {
            console.error(ex)
        }
    }
    // const loadCourses = async () => {
    //     setLoading(true);
    //     try {
    //         // let url = `${endpoints['courses']}?q=${q}&category_id=${cateId}`;
    //         let res = await APIs.get(endpoints['courses']);
    //         setCourses(res.data.results);
    //     } catch (ex) {
    //         console.error(ex);
    //     } finally {
    //         setLoading(false);
    //     }r
    // }

    useEffect(() => {
        loadCates();
    }, [])

    // useEffect(() => {
    //     loadCourses();
    // }, [])

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.subject}>DANH MỤC LỰA CHỌN</Text>
            <View style={MyStyles.row}>
                {categories===null?<ActivityIndicator/>:<>      
                    {Array.isArray(categories) && categories.map(c => <Chip style={MyStyles.margin} key={c.id} icon="shape">{c.name}</Chip>)}
                </>}
            </View>

            {/* <Searchbar
                placeholder="Search"
               ></Searchbar>
            <ScrollView >
                {Array.isArray(courses) && courses.map(c => <List.Item style={MyStyles.margin} key={c.id} title={c.subject} description={moment(c.created_date).fromNow()} left={() => <Image style={MyStyles.avatar} source={{uri: c.image}}/>} />)}
                {loading && <ActivityIndicator />}
            </ScrollView> */}
        </View>
    )
}
export default Room;