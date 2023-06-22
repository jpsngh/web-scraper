import {connectToMongoDB,seedData} from "./seeder.js"
import {urls,start} from "./app.js"



function execute (){
    try{
        
        connectToMongoDB();
        start(urls);
        seedData();


    }
    catch(err){
        console.log(err,"error ")
    }
}

execute();