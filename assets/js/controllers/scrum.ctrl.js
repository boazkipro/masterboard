app.controller('scrumCtrl', ["$scope", "$ionicModal",'$rootScope', function($scope, $ionicModal, $rootScope){
	
     //SOCKET.IO
        $scope.connectedUsers = [];
        var socket = io.connect('localhost:3000');
        socket.on('connect', function(){
            if ( $scope.storage.user && $scope.storage.user.username ){
                socket.emit('addUser',$scope.storage.user.username);  
            }
            //connectedUsers.push( $scope.storage.user.firstname );

        });

        socket.on('connectedUsers',function(users){
            $scope.connectedUsers = users;
            $scope.$apply();

        });

    $scope.addingProject = false;
    $scope.isProject = function (){
        $scope.addingProject = ($scope.addingProject == true)?false:true;
    }

    $scope.addingUser = false;
    $scope.addUser = function (){
        $scope.addingUser = ($scope.addingUser == true)?false:true;
    }

    $scope.editingUser = false;
    $scope.editUser = function (){
        $scope.editingUser = ($scope.editingUser == true)?false:true;
    }

    $scope.addingTask = false;
    $scope.addTask = function (pid) {
       
        $scope.addingTask = ($scope.addingTask == true)?false:true;
        $scope.storage.current_project = pid;
    }

    $scope.setProject = (pid)=>{ 

        $scope.storage.current_project = pid;
        window.location = "/#/dashboard";

     };

    $scope.fetched = {};
	$scope.fetch = function(table, data, udi){
		data = (data)?$scope.app.json(data):{};
		data.table = table;
		data.command = 'get';
		$scope.scrum.ajax(data)
			.then(function(res){

				if (res.response == 200){
					$scope.fetched[table] = res.data.message;
				} else {
					$scope.app.alert('Error Message', '<center>'+ res.data.message+ '</center>');
				}
			})
	};

	  /**
     * DATABASE CENTRIC ADDITION AND DELETION
     */
    //Define the main application objects
    $scope.add      = {};
    $scope.fetch    = {};
    $scope.fetched  = {};
    $scope.data     = {};
    $scope.data.users     = {};
     
    $scope.data.login   = {};
    $scope.data.admin   = {};
    
    $scope.frame.changeAdmin(false);
    $scope.logedin  = false;    
    
     //! BASIC ADDITION
     $scope.add = (table,data,UID)=>{
                    data = (data)?$scope.app.json(data):{};
                    data.command   = "add";
                    data.table     = (table != undefined)?table.toString().replace(/vw_/ig,''):"";
                    //data.token     = $scope.storage.admin._;
                    data.token		= { user:"undefined", key: "undefined" }
                    data.extras    =  (data)? ( (data.extras)?data.extras.replace(/LIMIT 1/ig,''): undefined ):undefined;
                    //console.dir(data)
                    $scope.scrum.ajax( data )
                    .then( (r) => {           
                        $scope.app.UID(UID,`<center>${(r.response != 200)?r.data.message: "Record Successfully Added."}</center>`, (r.response == 200) ? "success" : "danger");
                       if(r.response == 200){
                           $scope.fetch(table,{specifics: data.specifics}); 
                           $scope.data[data.toString().replace(/vw_/ig,'')] = {};
                       };           
                        $scope.$apply();
                    })        
                };

     //! BASIC UPDATING
     $scope.update = (table,data,UID,cryptFields)=>{
                    data = (data)?$scope.app.json(data):{};                    
                    data.command   = "update";
                    data.table     = (table != undefined)?table.toString().replace(/vw_/ig,''):"";
                    // 
                    data.token     =  data.token || { user:"undefined", key: "undefined" };
                    data.extras    =  (data)? ( (data.extras)?data.extras.replace(/LIMIT 1/ig,''): undefined ):undefined;
                    if(cryptFields){ 
                       cryptFields.split(",").forEach((cryptField)=>{
                           data[cryptField] = $scope.app.md5(data[cryptField]) 
                       });                        
                    }
                    $scope.scrum.ajax( data )
                    .then( (r) => {           
                       r = $scope.app.json(r);
                       if(r.response == 200){
                           $scope.app.UID(UID,`<center> "Record Successfully Updated."</center>`, "success");                          
                           $scope.fetch(table,{specifics: data.specifics}); 
                           $scope.data[data.toString().replace(/vw_/ig,'')] = {};
                       }else{
                           //POSTGRESQL MATCHING
                            if(Array.isArray(r.data.message)){
                                var v =  r.data.message[2].match(/DETAIL:(.*)/)
                                if( v != undefined || v!=null ){
                                    r.data.message = v[1];
                                }else{
                                    r.data.message = r.data.message[2];
                                }
                            }else{
                                r.data.message;
                            }
                        
                            $scope.app.alert("ERROR",`<center>${ r.data.message }</center>`,$scope.app.doNothing,"CONTINUE");
                       }           
                        $scope.$apply();
                    })        
                };
    
    //! BASIC FETCHING
    $scope.fetch = (table,data,UID)=>{
        data = (data)?$scope.app.json(data):{};
        data.command    = "get";
        data.table      = table;        
        $scope.scrum.ajax(data)
        .then(function(r){
            r = $scope.app.json(r);
            if(r.response == 200){
                $scope.fetched[table] = r.data.message;
            }else{
                $scope.app.alert("ERROR",`<center>${r.data.message}</center>`,$scope.app.doNothing,"CONTINUE");
            }
            $scope.$apply();
        }) 
    };
      
      
    //! BASIC DELETION  
    $scope.del = (table,data,UID,delID)=>{
        data = (data)?$scope.app.json(data):{};
        //console.dir(data)
        data.command    = "del";
        data.table      = (table != undefined)?table.toString().replace(/vw_/ig,''):"";
        //data.token      = $scope.storage.admin._;
        data.token		= { user:"undefined", key: "undefined" }
        $scope.scrum.ajax(data)
        .then(function(r){
            r = $scope.app.json(r);
            if(r.response == 200){                           
                $scope.fetched[table].splice(delID,1);  
                $scope.app.UID('response',`<center>Deleted.</center>`,"info");                           
            }else{
                $scope.app.UID('response',`<center>${r.data.message}</center>`,"danger");
            }
            $scope.$apply();
                
        })
    };

    //Basic User Login
    $scope.login = () => {
        
        $scope.data.login.command   = "get";
        $scope.data.login.table     = "users";
        $scope.data.login.extras    = "LIMIT 1";
        $scope.scrum.ajax( $scope.data.login )
        .then((r)=>{
                r = $scope.app.json(r);
                if(r.response == 200){
                                        
                    if(r.data.message.length > 0 && typeof(r.data.message[0]) == "object" ){
                        if(  r.data.message[0]['telephone_number'] == $scope.data.login.telephone_number  ){
                            $scope.storage.user = r.data.message[0];
                            $scope.logedin      = true;
                            socket.emit('addUser',$scope.storage.user.username); 
                        }else{
                           delete $scope.storage.user;
                           window.location = "/#/projects";
                        }
                        
                    }else{
                        delete $scope.storage.user;
                        $scope.app.UID('response',`<center>You have entered the wrong login credentials.</center>`,"danger");
                    }
                    
                }else{
                    $scope.app.alert("ERROR",`<center>Application error.<br>Failed to log you in.<br></center>`,$scope.app.doNothing,"CONTINUE");
                    delete $scope.storage.user;
                }
                $scope.$apply();
                
            })
    };

    //Basic admin login
    $scope.adminLogin = () => {
        $scope.data.admin.command   = "get"
        $scope.data.admin.table     = "admin"
        $scope.data.admin.extras    = "LIMIT 1"
        $scope.scrum.ajax($scope.data.admin)
        .then((r)=>{
            r = $scope.app.json(r);
            if(r.response == 200){
                
                if(r.data.message.length > 0 && typeof(r.data.message[0]) == "object" ){
                    
                    if(  r.data.message[0]['password'] === $scope.data.admin.password  ){
                        $scope.storage.admin        = r.data.message[0];
                        $scope.storage.admin._      = {};
                        $scope.storage.admin._.user = r.data.message[0].admin_name;
                        $scope.storage.admin._.key  = r.data.message[0].password;
                        $rootScope.frame.changeAdmin(true);
                    }else{
                        delete $scope.data.admin;
                        delete $scope.storage.admin;
                        window.location = "/#/admin"; 
                    }
                    
                }else{
                    delete $scope.data.admin;
                    delete $scope.storage.admin;
                    $scope.app.UID('response',`<center>You have entered the wrong login credentials.</center>`,"danger");
                    window.location = "/#/admin";                       
                    
                }
                
            }else{
                //console.dir(r)
                $scope.app.alert("ERROR",`<center>${r.data.message}</center>`,$scope.app.doNothing,"CONTINUE");
                delete $scope.storage.admin;
            }
            $scope.$apply();
        })
    };

    $scope.islogedin = () => {
        if($scope.storage.user){
            $scope.data.login.telephone_number = $scope.storage.user.telephone_number;
            $scope.data.login.password         = $scope.storage.user.password;
            // $rootScope.frame.showMenu = true;
            $scope.login();
        }
    };
    
    $scope.logout = () => {
        $scope.logedin = false;
        // $rootScope.frame.showMenu = false;
        delete $scope.storage.user;
        window.location = '/#/';
    };

    // Basic Admin Auth
    $scope.authorize = () => {
        if($scope.storage.admin){
           $scope.data.admin        = {}; 
           $scope.data.admin.admin_name    = $scope.storage.admin.admin_name;
           $scope.data.admin.password      = $scope.storage.admin.password;
           // $rootScope.frame.showMenu = true;
           $scope.adminLogin();
        }else{
            $scope.location = "/#/admin";
        }
    };
    
    $scope.deauthorize = () => {
        delete $scope.storage.admin; 
        // $rootScope.frame.showMenu = false;
        $rootScope.frame.changeAdmin(false);               
        window.location = '/#/';
    };

      $scope.centerAnchor = true;
        $scope.toggleCenterAnchor = function () {$scope.centerAnchor = !$scope.centerAnchor}
        $scope.draggableObjects = [{name:'one'}, {name:'two'}, {name:'three'}];
        $scope.droppedInproductBacklog = [];
        $scope.droppedInSprint = [];
        $scope.droppedInBlockers = [];
        $scope.droppedInDone = [];
        
        $scope.onDropCompleteInDone = function(data,evt){

            console.dir(evt);
            data.taskstatus = "completed";
            data.extras = "taskid = '"+ data.taskid +"'";
            data.$$hashKey = undefined;
            $scope.update('tasks', data);
            $scope.droppedInDone.push(data);
            console.dir($scope.droppedInDone);
        }

        $scope.onDropCompleteInBlockers = function(data,evt){

            console.dir(evt);
            data.taskstatus = "blocked";
            data.extras = "taskid = '"+ data.taskid +"'";
            data.$$hashKey = undefined;
            $scope.update('tasks', data);
            $scope.droppedInDone.push(data);
            console.dir($scope.droppedInBlockers);
        }

        $scope.onDropCompleteInSprint = function(data,evt){

            console.dir(evt);
            data.taskstatus = "in progress";
            data.extras = "taskid = '"+ data.taskid +"'";
            data.$$hashKey = undefined;
            $scope.update('tasks', data);
            $scope.droppedInDone.push(data);
            console.dir($scope.droppedInSprint);
        }

        $scope.onDropCompleteInproductBacklog = function(data,evt){

            console.dir(evt);
            data.taskstatus = "created";
            data.extras = "taskid = '"+ data.taskid +"'";
            data.$$hashKey = undefined;
            $scope.update('tasks', data);
            $scope.droppedInDone.push(data);
            console.dir($scope.droppedInBlockers);
        }

        // $scope.onDragSuccessInDone=function(data,evt){
        //     // console.log(evt);
        //     // var index = $scope.droppedObjects1.indexOf(data);
        //     // if (index > -1) {
        //     //    $scope.droppedObjects1.splice(index, 1);
        //     // }
        //     // evt.preventDefault();
        //     // var data = evt.dataTransfer.getData("text");
        //     // evt.target.appendChild(document.getElementById(data));

        //     // var destid = evt.target.id;
        //     // console.log(data+''+ destid);
        //    // ajax code for enabling the updateStatus query
        //     // $.ajax({
        //     //     type:'POST',
        //     //     url:'updateStatus.jsp',
        //     //     data: {data : data, dest : destid}
        //     //     });
        // }
        // $scope.onDragSuccess2=function(data,evt){
        //     var index = $scope.droppedObjects2.indexOf(data);
        //     if (index > -1) {
        //         $scope.droppedObjects2.splice(index, 1);
        //     }
        // }
        // $scope.onDropComplete2=function(data,evt){
        //     var index = $scope.droppedObjects2.indexOf(data);
        //     if (index == -1) {
        //         $scope.droppedObjects2.push(data);
        //     }
        // }
        var inArray = function(array, obj) {
            var index = array.indexOf(obj);
        }

        // $scope.allowDrop = function (ev) {
        //     ev.preventDefault();
        // }
        // $scope.drag = function (ev) {
        //         ev.dataTransfer.setData("text", ev.target.id);
        //     }
        // $scope.drop = function (ev) {
        //         // 
        //         console.log(ev);
        //         // var data = ev.dataTransfer.getData("text");
        //         // ev.target.appendChild(document.getElementById(data));

        //         // var destid = ev.target.id;
        //         // ajax code for enabling the updateStatus query
        //         // $.ajax({
        //         //          type:'POST',
        //         //          url:'updateStatus.jsp',
        //         //          data: {data : data, dest : destid}
        //         //     });
        //     }

}]);