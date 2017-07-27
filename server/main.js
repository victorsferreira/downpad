import { Meteor } from 'meteor/meteor';

var crypto = require('crypto');
const Pages = new Mongo.Collection('pages');
const secret = '1234567890piuytrewqazxswedcvfrtgbnhyujmkiiolçpçlkjhgfdsazxcvbnm';

Meteor.startup(() => {
    var page = Pages.findOne({name: 'sss'});
    console.log('page',page)
    // code to run on server at startup
});

function cypher(input){
    return crypto.createHash('md5').update(input).digest("hex");
}

Meteor.methods({
    xpto:({ foo, foo2 })=>{
        console.log('foo', foo,'foo2', foo2)
        return true;
    },
    findPage:({ name })=>{
        var page = Pages.findOne({name: name});
        console.log('Page found', page);
        return page;
    },
    setPassword:({password, repeat_password, name})=>{
        if(password == repeat_password){
            password = cypher(password);

            Pages.update({name: name}, { $set: {
                password: password
            } });

            return true;
        }

        return false;
    },
    removePassword:({password, repeat_password, name})=>{
        if(password == repeat_password){
            Pages.update({name: name}, { $set: {
                password: null
            } });

            return true;
        }

        return false;
    },
    openPageWithPassword:({name, password})=>{
        password = cypher(password);

        var page = Pages.findOne({name: name});
        var time = Date.now();

        console.log('passwords: ', page.password, password);

        if(page && page.password == password){
            console.log('encontrou página e password é igual');
            return {
                markdown: page.markdown,
                last_update: page.last_update
            };
        }

        return false;
    },
    saveMarkdown:({name, markdown})=>{
        var page = Pages.update({name: name}, { $set: {
            markdown: markdown,
            last_update: Date.now()
        } });

        return Date.now();
    }
});

// Router.route('/password', {where: 'server'})
// .post(function () {
//     var password = this.request.body.password;
//     var repeat_password = this.request.body.repeat_password;
//     var name = this.request.body.name;
//
//     if(password == repeat_password){
//         Pages.update({
//             name: name
//         },{$set : {
//             password: password
//         }});
//     }
// });
