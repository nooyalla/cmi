const GSR = require('google-search-results-nodejs')
const {GOOGLE_API_KEY} = process.env;
const client = new GSR.GoogleSearchResults(GOOGLE_API_KEY);
async function getImageUrl(text){

    const query_params = {
        q: text,
        google_domain: "Google Domain",
        num: 1,
        start: 0,
        tbm: "isch",
        async: true|false,   // allow async query
        output: "json", // output format
    }
   return new Promise((resolve,reject)=>{
       try {
           client.json(query_params, (result) => {
               console.log('result', result)
               resolve(result)
           })
       } catch (e) {
           console.log("error",e)
       }
   });

}

module.exports = {
    getImageUrl,
};



