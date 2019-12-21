import { Component } from 'react';
import React from 'react';
import Loader from '../components/Loader';
const isMobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
const defaultImage = "https://adsk-git-dashboard.herokuapp.com/default.png";
//const mySound = new sound("bounce.mp3");
class Image extends Component{
    onError = (ev)=>{
        if (!ev.target.secondTry){
            ev.target.secondTry = true;
            ev.target.src=this.props.src;
        }else{
            ev.target.src=defaultImage;
        }
    }
    render(){
        const className = this.props.cssClass || "userImage";
        return  (<img className={className} src={this.props.src} onError={this.onError}></img>);
    }
}
class App extends Component {
    constructor(props){
        super(props);
        this.state={
            data: null,
            user:null
        };
        this.createSocket =   this.createSocket.bind(this);
        const THIS = this;
        setTimeout(THIS.createSocket, 1400);
    }

    createSocket(){
        console.log('createSocket start');
        if (this.socket) {
            console.log('socket already exist');
            return;
        }
        const THIS=this;
        try{
            this.socket = io();
            if (this.socket) {
                this.socket.on('update',(data)=>{
                    console.log('socket update event',data);
                    THIS.setState({data});
                });
                this.socket.on('disconnect',()=>{
                    console.log('socket disconnect event');
                    THIS.socket=null;
                    THIS.setState({data: null});
                    setTimeout(THIS.createSocket, 5000);
                });
                this.socket.emit('refresh',groupId);
            }else{
                console.log('this.socket is not truthy..');

            }
        }catch(err){
            console.log('failed to create/emit socket io');
        }
    };


    getRepositories = (repositories)=>{
       return repositories.map(repository =>{
            return (
                <div key={repository.name} className="repository">
                    <div>
                        <Image src={repository.ownerAvatarUrl} />
                     </div>
                    <div>
                          <b>{`${repository.ownerName} / ${repository.name}`}</b> ({repository.language})
                    </div>
                </div>);
        });
    }

    getUsers = (users)=>{
        return users.map(user =>{
            return (
                <div key={user.username} className="user" onClick={()=>{this.showModal(user)}}>
                    <div>
                        <Image src={user.avatarUrl} />
                    </div>
                    <div>
                        <b>{user.name}</b> ({user.username})
                    </div>
                </div> );
        });
    }

    getCommiters = (commitersRankings, users)=>{
        return commitersRankings.map((commiter,index) =>{
            const { username, branchesAsComitterCount, avarageComments }= commiter;
            const user = users[username];

            return (
                <div key={user.username} className="user">
                    <div className="columnHeader">
                        #{(index + 1)} -   <b>{user.name}</b>  ({user.username})
                    </div>
                    <div>
                        <Image src={user.avatarUrl} />
                    </div>
                     <div>
                        {avarageComments} {(avarageComments > 1 ? 'reviews' : 'review')} (on avarage) till PRs are approved [{branchesAsComitterCount} {branchesAsComitterCount > 1 ? 'branches' : 'branch'}]
                    </div>
                </div> );
        });
    }

    getReviewers = (reviewersRankings, users)=>{
        return reviewersRankings.map((reviewer,index) =>{
            const { username, branchesAsReviewerCount, reviewAvarageTime }= reviewer;
            const user = users[username];
            return (
                <div key={user.username} className="user">
                        <div className="columnHeader">
                            #{(index + 1)} -   <b>{user.name}</b>  ({user.username})
                        </div>
                        <div>
                            <Image src={user.avatarUrl} />
                        </div>
                        <div>
                            avarage of {reviewAvarageTime} to responses [{branchesAsReviewerCount} {branchesAsReviewerCount > 1 ? 'branches' : 'branch'}]
                        </div>
                </div> );
        });
    }

    getUsersColumn = (users) =>{
        if (isMobile){
            return <div/>;
        }
        return (
            <div id="usersWrapper" className= "col-xs-2 section">
                <div className="columnHeader">
                    <u>{users.length} users:</u>
                </div>
                <div id="users" className= "section">
                    {users}
                </div>
            </div> );
    }

    getRepositoriesColumn =(repositories)=>{
        if (isMobile){
            return <div/>;
        }
        return (
            <div id="repositoriesWrapper" className= "col-xs-2 section">
                <div className="columnHeader">
                    <u>{repositories.length} repositories:</u>
                </div>
                <div id="repositories" className= "section">
                    {repositories}
                </div>
            </div>);
    }

    getCommitersColumn = (commiters)=>{
        return (
            <div id="commiters" className= "col-xs-6 section">
                <div className="columnHeader">
                    <u> {commiters.length>0 ? 'Commiters:' : 'no commiters yet'}</u>
                </div>
                <div>
                    {commiters}
                </div>
            </div>);
    }

    getReviewersColumn = (reviewers)=>{
        return (
            <div id="reviewers" className= "col-xs-5 section">
                <div className="columnHeader">
                    <u> {reviewers.length>0 ? 'Reviewers:' : 'no reviewers yet'}</u>
                </div>
                <div>
                    {reviewers}
                </div>
            </div>);
    }

    getRankingsColumn=(commiters,reviewers)=>{
        const commitersColumn = this.getCommitersColumn(commiters);
        const reviewersColumn = this.getReviewersColumn(reviewers);
        return  (
            <div id="rankings" className= "col-xs-12 col-md-7 section">
                <div className="columnHeader">
                    <u><b>Rankings:</b></u>
                </div>
                <div className="row">
                    {commitersColumn}
                    {reviewersColumn}
                </div>
            </div>);
    }
    closeModal=()=>{
        this.setState({user:null});
    }
    getModal=()=>{
        const { user } = this.state;
        if (!user){
            return <div/>;
        }
        const {commitersRankings, reviewersRankings, branchs,users} = this.state.data;

        const commiterInfo = commitersRankings.find(rank => rank.username === user.username);
        const reviewerInfo = reviewersRankings.find(rank => rank.username === user.username);
        const userInfo1 = commiterInfo ? `Has ${commiterInfo.branchesAsComitterCount} approved ${commiterInfo.branchesAsComitterCount == 1 ? 'PR' :'PRs'}.` : 'No approved PRs';
        const userInfo2 = reviewerInfo ? `Gave ${reviewerInfo.branchesAsReviewerCount} ${reviewerInfo.branchesAsReviewerCount == 1 ? 'review' :'reviews'} .` : 'Did not gave any reviews';

        const tableRows = branchs.filter(branch =>{
            return branch.username === user.username || (branch.reviewers && branch.reviewers.includes(user.username));
        }).map(branch =>{
            const reviewers = branch.reviewers ? branch.reviewers.map(reviewerUsername=> users[reviewerUsername] ? users[reviewerUsername].name : reviewerUsername).join(', ') : '  -';
            return (
                <tr className="">
                    <th className="tableContent">{branch.repositoryName}</th>
                    <th className="tableContent">{branch.name}</th>
                    <th className="tableContent">{users[branch.username] ? users[branch.username].name : branch.username}</th>
                    <th className="tableContent">{reviewers }</th>
                    <th className="tableContent">{branch.status}</th>
                </tr> );
        })
        return (
            <div>
                <div id="modal">
                </div>
                <div id="modalContent">
                        <div  className="row">
                             <span id="closeModal" onClick={this.closeModal}> X </span>
                        </div>
                        <div  className="userModal row">
                            <div className=" row" >
                                <div className="col-xs-2">
                                    <Image src={user.avatarUrl} cssClass="modalUserImage"/>
                                </div>
                                <div className="col-xs-9">
                                    <div className="bigText">
                                        <b>{user.name}</b>
                                    </div>
                                    <div className="mediumText">
                                        username: {user.username}
                                    </div>
                                    <div className="mediumText">
                                        email: {user.email}
                                    </div>
                                    <div id="userModalInfo" className="mediumText">
                                        <div>
                                            {userInfo1}
                                        </div>
                                        <div>
                                            {userInfo2}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="userBranches" className="row" >
                                <div className="mediumText">
                                    branches:
                                </div>
                                <div id="modalTable">
                                    <table>
                                        <thead>
                                            <tr className="">
                                                <th className="tableHeaderColumn"><u>Repository</u></th>
                                                <th className="tableHeaderColumn"><u>Branch Name</u></th>
                                                <th className="tableHeaderColumn"><u>Created By</u></th>
                                                <th className="tableHeaderColumn"><u>Reviewers</u></th>
                                                <th className="tableHeaderColumn"><u>Status</u></th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                            {tableRows}
                                        </tbody>
                                    </table>
                               </div>
                            </div>
                        </div>
                </div>
            </div> );

    };

    showModal=(user)=>{
        this.setState({user});
    };

    render() {
        const {data} = this.state;
        if (!data){
            console.log("loader..");
            return (<Loader />);
        }
        console.log("data:",data)
        const repositories = this.getRepositories(Object.values(data.repositories));
        const repositoriesColumn = this.getRepositoriesColumn(repositories);
        const users = this.getUsers(Object.values(data.users));
        const usersColumn = this.getUsersColumn(users);
        const commiters = this.getCommiters(data.commitersRankings, data.users);
        const reviewers = this.getReviewers(data.reviewersRankings, data.users);
        const rankingsColumn = this.getRankingsColumn(commiters,reviewers);

        const modal = this.getModal();
        return (
            <div className="paddingLeftTop">
                <div>
                      Updated at: {data.updateDate}
                </div>
                <div className="row">
                    {rankingsColumn}
                    {usersColumn}
                    {repositoriesColumn}
                </div>
                {modal}
            </div>);
    }
}


export default App;
