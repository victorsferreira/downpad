import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';
import { Cookies } from 'meteor/ostrio:cookies';
import App from '../imports/ui/App.jsx';

const Cookie = new Cookies();
const Pages = new Mongo.Collection('pages');

FlowRouter.route('/:name', {
    action: function(params, queryParams) {
        var name = params.name;
        var props = {};

        Meteor.call('findPage', {
            name: name
        }, (err, res) => {
            if (err) {
                console.log('err',err);
            } else {
                console.log('Page returned', res);
                var page = res;

                if(page){
                    if(page.password){
                        props.has_password = true;
                    }else{
                        props.has_password = false;
                        props.markdown = page.markdown;
                        props.last_update = page.last_update;
                    }

                    if(Cookie.has('downpad') && Cookie.get('downpad') == name){
                        props.is_owner = true;
                    }

                }else{
                    props.markdown = '';
                    props.is_owner = true;
                    props.has_password = false;

                    var page = Pages.insert({
                        name: name,
                        markdown:'',
                        password: null,
                        last_update: null
                    });

                    Cookie.set('downpad', name);
                }

                props.name = name;

                mount(App, props);
            }
        });
    }
});
