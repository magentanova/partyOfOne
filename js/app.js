// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }
                // guests: {no: this.props.guestColl.where({status: "no"}),
                //         yes: this.props.guestColl.where({status: "yes"}),
                //         pending: this.props.guestColl.where({status: "pending"})
                //     }


import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'backbone'

function app() {
    // start app
    // new Router()
    var GuestModel = Backbone.Model.extend({

        defaults: {
            partySize: 1,
            status: "pending"
        },

        initialize: function(newName) {
            this.set({name: newName})
        }
    })

    var GuestCollection = Backbone.Collection.extend({
        model: GuestModel
    })

    var PartyView = React.createClass({

        _addGuest: function(name) {
            this.state.guestColl.add(new GuestModel(name))
            this._updater()
        },

        _genbuttons: function() {
            var butts = ["pending","no","yes","all"].map(function(guestType){
                return <button onClick={this._filterView} value={guestType}>{guestType}</button>
            }.bind(this))
            return butts
        },

        _filterView: function(event) {
            var buttView = event.target.value
            this.setState({
                viewType: buttView
            })
        },

        _removeGuest: function(model) {
            this.state.guestColl.remove(model)
            this._updater()
        },

        _updater: function() {
            this.setState({
                guestColl: this.state.guestColl
            })
        },

        getInitialState: function() {
            return {
                guestColl: this.props.guestColl,
                viewType: "all"
            }
        },

        render: function() {
            var guestColl = this.state.guestColl
            if (this.state.viewType === "pending") guestColl = guestColl.where({status:"pending"})
            if (this.state.viewType === "yes") guestColl = guestColl.where({status:"yes"})
            if (this.state.viewType === "no") guestColl = guestColl.where({status:"no"})

            return (
                <div className="partyView">
                    <div className="buttons">{this._genbuttons()}</div>
                    <GuestAdder adderFunc={this._addGuest}/>
                    <GuestList updater={this._updater} guestColl={guestColl} remover={this._removeGuest}/>
                </div>  
                )
        }
    })

    var GuestAdder = React.createClass({

        _handleKeyDown: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var guestName = keyEvent.target.value
                this.props.adderFunc(guestName)
                keyEvent.target.value = ''
            }
        },

        render: function() {
            return <input onKeyDown={this._handleKeyDown} />
        }
    })

    var GuestList = React.createClass({

        _makeGuest: function(model) {
            return <Guest updater={this.props.updater} guestModel={model} remover={this.props.remover}/>
        },


        render: function() {
            console.log(this)
            return (
                <div className="guestList">
                    {this.props.guestColl.map(this._makeGuest)}
                </div>
                )
        }
    })

    var Guest = React.createClass({

        _selectStatus: function(event) {
            var newStat = event.target.value
            this.props.guestModel.set({status:newStat})
            this.props.updater()
        },

        _clickHandler: function() {
            this.props.remover(this.props.guestModel)
        },

        render: function() {
            return <div className="guest">
                        <p>{this.props.guestModel.get('name')}</p>
                        <p>{this.props.guestModel.get('status')}</p>
                        <select onChange={this._selectStatus} >
                            <option value="">change rsvp</option>
                            <option value="pending">pending</option>
                            <option value="no">no</option>
                            <option value="yes">yes</option>
                        </select>
                        <button onClick={this._clickHandler}>x</button>
                    </div>
        }
    })

    var PartyRouter = Backbone.Router.extend({
        routes: {
            "*default": "home"
        },

        home: function() {
            DOM.render(<PartyView guestColl={new GuestCollection()}/>,document.querySelector('.container'))
        },

        initialize: function() {
            Backbone.history.start()
        }
    })

    var pr = new PartyRouter()

}

app()
