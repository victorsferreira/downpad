import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Cookies } from 'meteor/ostrio:cookies';
import Modal from 'react-modal';
import moment from 'moment';
//
const FontAwesome = require('react-fontawesome');
const cookie = new Cookies();

// App component - represents the whole app
export default class App extends Component {
    constructor(){
        super();

        this.state = {
            show_modal: false,
            markdown: '',
            password: '',
            repeat_password: '',
            status: 0,
            last_update: null,
            name: '',
            editor_class: '',
            display_class: ''
        };

        this.converter = new Showdown.converter();
        this.timer = null;
    }

    componentWillMount() {
        if(this.props.markdown){
            this.setState({
                markdown: this.props.markdown
            });
        }

        this.setState({
            has_password: this.props.has_password,
            asks_password: this.props.has_password,
            last_update: this.props.last_update
        });
    }

    saveMarkdown(){
        Meteor.call('saveMarkdown', {
            markdown: this.state.markdown,
            name: this.props.name
        }, (err, res) => {
            console.log('res',res);
            console.log('err',err);

            if(!err && res){
                this.setState({
                    status: 2,
                    last_update: Date.now()
                })
            }
        });
    }

    openPageWithPassword(){
        Meteor.call('openPageWithPassword', {
            password: this.state.password,
            name: this.props.name
        }, (err, res) => {
            console.log('res',res)
            console.log('err',err)

            if(!err){
                if(typeof(res) === 'object') {
                    this.setState({
                        markdown: res.markdown,
                        last_update: res.last_update,
                        asks_password: false
                    });
                }
            }
        });
    }

    setPassword(){
        Meteor.call('setPassword', {
            password: this.state.password,
            repeat_password: this.state.repeat_password,
            name: this.props.name
        }, (err, res) => {
            console.log('res',res)
            console.log('err',err)

            if(!err){
                if(res == true) {
                    this.setState({
                        has_password: true,
                        show_modal: false
                    });
                }
            }
        });
    }

    applyColor(input){
        var matches = input.match(/\[color="#[0-9|a|b|c|d|e|f]{3,6}"\]/g);
        if(matches){
            var current_match = '', color;

            while(matches.length){
                current_match = matches.shift();
                color = current_match.split('[color="')[1].split('"]')[0];
                input = input.replace(current_match,'<span style="color: '+color+'">');
                input = input.replace('[/color]','</span>');
            }
        }

        return input;
    }

    applyFamily(input){
        var matches = input.match(/\[family=".*"\]/g);
        if(matches){
            var current_match = '', family;

            while(matches.length){
                current_match = matches.shift();
                family = current_match.split('[family="')[1].split('"]')[0];
                console.log(family)
                input = input.replace(current_match,'<span style="font-family: '+family+'">');
                input = input.replace('[/family]','</span>');
            }
        }

        return input;
    }

    removePassword(){
        Meteor.call('removePassword', {
            password: this.state.password,
            repeat_password: this.state.repeat_password,
            name: this.props.name
        }, (err, res) => {
            console.log('res',res)
            console.log('err',err)
            if(!err){
                if(res == true) {
                    this.setState({ has_password: false});
                }
            }
        });
    }

    changeEditorClass(){
        if(this.state.display_class == ''){
            this.setState({
                display_class: 'full',
                editor_class: 'closed'
            });
        }else{
            this.setState({
                display_class: '',
                editor_class: ''
            });
        }
    }

    //
    render() {
        var markdown = this.converter.makeHtml(this.state.markdown);
        markdown = this.applyColor(markdown);
        markdown = this.applyFamily(markdown);

        return (
            <div className="container">

                <Modal
                    isOpen={this.state.asks_password}
                    style={{}}
                    contentLabel="Password required"
                    >

                    <div>
                        <label>Password</label>
                        <input type="text" name="password"  onChange={(event)=>{
                                this.setState({
                                    password: event.target.value
                                })
                            }
                        } />
                    </div>

                    <button onClick={()=>{
                            this.openPageWithPassword();
                        }}>Open
                    </button>

                </Modal>

                <Modal
                    isOpen={this.state.show_modal}
                    style={{}}
                    onRequestClose={()=>{
                        this.setState({
                            show_modal: false
                        })
                    }}
                    contentLabel="Example Modal"
                    >

                    <div>
                        <label>Password</label>
                        <input type="text" name="password"  onChange={(event)=>{
                                this.setState({
                                    password: event.target.value
                                })
                            }
                        } />
                    </div>

                    <div>
                        <label>Repeat password</label>
                        <input type="text" name="repeat_password"  onChange={(event)=>{
                                this.setState({
                                    repeat_password: event.target.value
                                })
                            }
                        } />
                    </div>

                    <button onClick={()=>{
                            this.setPassword();
                        }}>Save
                    </button>

                </Modal>

                <header>
                    <div className="dashboard">
                        <div>
                            <strong>Status: </strong>
                            <span>
                                {
                                    this.state.status > 0 ? (
                                        this.state.status == 1 ? 'saving' : 'saved'
                                    ) : 'opened'
                                }
                            </span>
                        </div>

                        <div>
                            <strong>Last update: </strong>
                            <span>
                                {
                                    this.state.last_update ? (moment(this.state.last_update).format('DD/MM/YYYY hh:mm:ss')) : ('-')
                                }
                            </span>
                        </div>
                        {
                            this.props.is_owner && this.props.is_owner == true ? (
                                <div>
                                    <strong>Password: </strong>
                                    {
                                        this.state.has_password ? (
                                            <span
                                                className="password-option"
                                                onClick={()=>{
                                                    this.removePassword();
                                                }}>
                                                remove
                                            </span>
                                        ) : (
                                            <span
                                                className="password-option"
                                                onClick={()=>{
                                                    this.setState({
                                                        show_modal: true
                                                    })
                                                }}>
                                                add
                                            </span>
                                        )
                                    }
                                </div>
                            ) : (null)
                        }
                    </div>

                    <button
                        className="close-editor"
                        onClick={()=>{
                            this.changeEditorClass();
                        }}
                        >
                        {
                            this.state.display_class == 'full' ? 'Open' : 'Close'
                        }
                    </button>
                </header>

                <div className={'column '+this.state.display_class}>
                    <div className="content" dangerouslySetInnerHTML={{__html: markdown}}></div>
                </div>

                <div className={'column '+this.state.editor_class}>
                    <textarea
                        value={this.state.markdown}
                        onChange={(event)=>{

                            this.setState({
                                markdown: event.target.value,
                                status: 1
                            });

                            clearTimeout(this.timer);

                            this.timer = setTimeout(()=>{
                                this.saveMarkdown();
                            },2000);

                        }}></textarea>
                    </div>
                </div>
            );
        }
    }
