import React, { Component } from 'react';
import consts from '../consts';
const { SITE_URL } = consts;
const prefix = `${SITE_URL}/images/`;
const ANON = `${prefix}anonymous.png`;

export default class ActiveGame extends Component {

    constructor(props){
        super(props);
        this.state={
        };
        this.socketCreation = this.socketCreation.bind(this);
        this.createPlayerRow = this.createPlayerRow.bind(this);
        this.socketCreation();
    }

    socketCreation(){
        if (this.socket) return;
        try{
            const THIS = this;
            const { groupId } = this.props;
            this.socket = io();
            console.log('creating socket io ');

            this.socket.on('connect',()=>{
                console.log('socket io: got connect event');
            });

            this.socket.on('GameUpdate',(game)=>{
               console.log('socket io: got GameUpdate event ',game);
               THIS.setState({game, finished:false, canceled:false});
            });
            this.socket.on('GameSaved',(game)=>{
               console.log('socket io: got GameSaved event ',game);
               THIS.setState({game, finished: true, canceled:false});
               //force update
               setTimeout(()=>{
                   try{
                     location.reload();
                   }catch(e){
                        //console.error(e);
                   }
             
               },15000)
             
            });
            this.socket.on('GameCancel',()=>{
               console.log('socket io: got GameCancel event');
               THIS.setState({game: null, finished:false, canceled: true});
               THIS.socket = null;
               setTimeout(THIS.socketCreation,2500);
            });
            this.socket.on('disconnect',()=>{
                console.log('socket io: got disconnect event');
                THIS.socket = null;
                setTimeout(THIS.socketCreation,2500)
             });
            this.socket.emit('Register',groupId);
            
        }catch(err){
            console.error('Failed to create/emit socket io',err);
        }
    }

    createPlayerRow(player){
        const { game } = this.state;
        const playersCount = game.players ? game.players.length : 1;
        const { groupCurrencySign , playersData } = this.props;
        const { enter, exit, hasFinishPlaying, id} = player;
        const dif = (parseInt(exit) - parseInt(enter));
        const bottomLineValue = `${dif>0?'+':''}${dif}`;
        const playerObject =  playersData[id];
        if (!playerObject){
            console.error('no playerObject,id ',id,' playersData:',playersData)
        }
        const imageUrl = playerObject && playerObject.imageUrl ? playerObject.imageUrl : ANON;
        const displayName = playerObject && playerObject.displayName ? playerObject.displayName : `${player.firstName} ${player.familyName}`;

        const exitCol = hasFinishPlaying ? (
                <div className="col-xs-2">
                    { exit }{groupCurrencySign}
                </div>) : <div/> ;

        const bottomLineClassname = "col-xs-2 "+(dif>0?'positiveBottomLineColor':'negativeBottomLineColor');     
        const bottomLine = hasFinishPlaying ? (
            <div className={bottomLineClassname}>
                { bottomLineValue }{groupCurrencySign}
            </div>) : <div/> ;

        const imageStyle = {}
        let imgHeight = (60 / playersCount)-0.5;
        imgHeight = imgHeight>16 ? 15 : imgHeight;
        imageStyle.height= `${imgHeight}vh`;
        return (
            <div className="col-xs-12 activeGamePlayerRow">
                <div className="col-xs-2 col-md-1">
                    <img className="activeGameImage" style={imageStyle} src={imageUrl} />
                </div>
                <div className="col-xs-4 col-md-5 centeredText">
                    { displayName }
                </div>
                <div className="col-xs-2">
                    { enter }{groupCurrencySign}
                </div>
                {exitCol}
                {bottomLine}
            </div>
        );

    }
    render() {
        this.socketCreation();
        const { groupCurrencySign } = this.props;
        const { game, finished, canceled} = this.state;
        const extraData= game ? game.extraData :'';
        const name = game ? game.name :'';
       
        const playersCount = game ? game.players.length : 0;
        const totalMoneyInPot = game ? game.players.map(player => parseInt(player.enter)).reduce(function(prevVal, elem) {
            return prevVal + elem;
        }, 0) : 0;
        const totalMoneyLeftInPot = game ? game.players.map(player => (parseInt(player.enter)-parseInt(player.exit)) ).reduce(function(prevVal, elem) {
            return prevVal + elem;
        }, 0) : 0;

       const finishedSection = (
           <div id="gameOverDiv" className="col-xs-12  blinking">
             Game Over
           </div>
       );

      
       const potText = (totalMoneyLeftInPot === totalMoneyInPot) ?
       `${totalMoneyInPot}${groupCurrencySign} in the pot` :
       `${totalMoneyLeftInPot}${groupCurrencySign} left in pot (from total of ${totalMoneyInPot}${groupCurrencySign})`;
        const gameHeaderSection = (
            <div className="row activeGameSubHeader">
            <hr/>
                {name},  {extraData},  { playersCount } Players<br/>
                {potText }
                {finished ? finishedSection : <span/>}
               
            </div>
        );


        const waitingForInfoSection =  (
            <div className="row activeGameSubHeader blinking">
                Waiting for info..
            </div>);

        const canceledSection =  (
            <div className="row activeGameSubHeader blinking">
                Game canceled..
            </div>);

        const gameDataSection = canceled ? canceledSection : (game ? gameHeaderSection : waitingForInfoSection);

        const players = game ? game.players.map(this.createPlayerRow) : <div/>;
        const playersHeader = !game || !game.players || game.players.length==0 ? <div/> : (
            <div className="col-xs-12 activeGameSmallHeaderTextSize">
                <div className="col-xs-6 centeredText">
                   Player
                </div>
                <div className="col-xs-2 ">
                   Buy-in
                </div>
                <div className="col-xs-2 ">
                   Cach-out
                </div>
                <div className="col-xs-2 ">
                   Balance
                </div>
              
            </div>
        );
        const playersSection = (
            <div className="row activeGameTextSize">
                <hr/>
                {playersHeader}
               
                <div className="row activeGameTextSize">
                <hr/>
                    {players}
                </div>
            </div>
        );
        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-12">
                        <div id="ActiveGameWrapperDiv">
                            <div className="row centeredText activeGameHeader">
                                <u>Active Game</u>
                            </div>
                          
                            { playersSection }
                            { gameDataSection}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
