angular.module('scrumit', ['ionic','ngMaterial','ngStorage','jsonFormatter','ngDraggable'])

	.controller('scrumCtrl', ["$scope", "$ionicModal", function($scope, $ionicModal){
	
	    $scope.addingProject = false;
	    $scope.isProject = function (){
	        $scope.addingProject = ($scope.addingProject == true)?false:true;
	    }

	    $scope.addingUser = false;
	    $scope.addUser = function (){
	        $scope.addingUser = ($scope.addingUser == true)?false:true;
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
	                        }else{
	                           delete $scope.storage.user;
	                           window.location = "/#/";
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
	            $scope.login();
	        }
	    };
	    
	    $scope.logout = () => {
	        $scope.logedin = false;
	        delete $scope.storage.user;
	        window.location = '/#/';
	    };

	    // Basic Admin Auth
	    $scope.authorize = () => {
	        if($scope.storage.admin){
	           $scope.data.admin        = {}; 
	           $scope.data.admin.admin_name    = $scope.storage.admin.admin_name;
	           $scope.data.admin.password      = $scope.storage.admin.password;
	           $scope.adminLogin();
	        }else{
	            $scope.location = "/#/admin";
	        }
	    };
	    
	    $scope.deauthorize = () => {
	        delete $scope.storage.admin; 
	        $rootScope.frame.changeAdmin(false);               
	        window.location = '/#/';
	    };

	       $scope.centerAnchor = true;
            $scope.toggleCenterAnchor = function () {
                $scope.centerAnchor = !$scope.centerAnchor
            }
            //$scope.draggableObjects = [{name:'one'}, {name:'two'}, {name:'three'}];
            var onDraggableEvent = function (evt, data) {
                console.log("128", "onDraggableEvent", evt, data);
            }
            $scope.$on('draggable:start', onDraggableEvent);
           // $scope.$on('draggable:move', onDraggableEvent);
            $scope.$on('draggable:end', onDraggableEvent);
            $scope.droppedObjects1 = [];
            $scope.droppedObjects2 = [];
            $scope.onDropComplete1 = function (data, evt) {
                console.log("127", "$scope", "onDropComplete1", data, evt);
                var index = $scope.droppedObjects1.indexOf(data);
                if (index == -1)
                    $scope.droppedObjects1.push(data);
            }
            $scope.onDragSuccess1 = function (data, evt) {
                console.log("133", "$scope", "onDragSuccess1", "", evt);
                var index = $scope.droppedObjects1.indexOf(data);
                if (index > -1) {
                    $scope.droppedObjects1.splice(index, 1);
                }
            }
            $scope.onDragSuccess2 = function (data, evt) {
                var index = $scope.droppedObjects2.indexOf(data);
                if (index > -1) {
                    $scope.droppedObjects2.splice(index, 1);
                }
            }
            $scope.onDropComplete2 = function (data, evt) {
                var index = $scope.droppedObjects2.indexOf(data);
                if (index == -1) {
                    $scope.droppedObjects2.push(data);
                }
            }
            var inArray = function (array, obj) {
                var index = array.indexOf(obj);
            }

	}])

	.service('scrum', [function(){

		this.ajax = function(data){
			return $.ajax({
				method : 'GET',
				url : '/php/index.php',
				data : data
			});
		}
	}])
	
	//!DEFINE THE APPLICATION RUNTIME DEFAULTS
	.run(["app","$rootScope","$location", "$localStorage", "scrum",function( app, $rootScope, $location, $localStorage, scrum ){
    
    //!INJECT THE LOCATION SOURCE TO THE ROOT SCOPE
    $rootScope.location = $location;

    //!INJECT THE $localStorage instance into the root scope
    $rootScope.storage = $localStorage;
    
    //!INJECT THE APPLICATION'S MAIN SERVICE TO THE ROOT SCOPE SUCH THAT ALL SCOPES MAY INHERIT IT
    $rootScope.app = app;
    $rootScope.scrum = scrum;
    $rootScope.frame = {};
    $rootScope.frame.is_admin = false;
    $rootScope.frame.isAdmin = function (){
        if ($rootScope.frame.is_admin == true){
            return true;
        } else {
           return false;
        }
    }

    $rootScope.frame.changeAdmin = function(bool){
        $rootScope.frame.is_admin = bool;
    };

    $rootScope.frame.reset = function(){
        delete $rootScope.storage.admin;
        delete $rootScope.storage.user;
        $rootScope.frame.changeadmin(false);
        window.location = "/#/";
    }
	}])

	.service("app",['$http','$ionicPopup',function( $http, $ionicPopup ){
  
		    //!SETUP THE APPLICATION BASICS
		    var url = window.location.href.split('/').filter(function(urlPortion){ return ( urlPortion != '' && urlPortion != 'http:' && urlPortion !=  'https:'  )  }) ;
			
		    //! APP CONFIGURATIONS
		    this.ip = url[0].split(':')[0];
		    this.port = url[0].split(':')[1];
		    this.hlink = "http://"+this.ip+":"+this.port;
		    
		    //global hlink = this.hlink;
		      
		    //!APPLICATION URL
		    //this.url = "http://41.89.162.4:3000";
		    this.url = this.hlink;
		    
		    
		    //! EMPTY CALLBACK
		   this.doNothing = function(){
		       
		   };    
		    
		    //!WRITE TO THE UI
		    this.UID = function( objectID, pageContent, c ){
		        
		        document.getElementById(objectID).innerHTML = `<div class='alert alert-${c}'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>${pageContent}</div>`;
		      
		    }; 
		    
		    //!AVAIL THE APPLICATION LINKS    
		    this.getData = function( success_callback , error_callback ){
		       
		       $.getJSON("../config/app.json", function( data ){
		            success_callback(data);
		        });
		        
		    };
		    
		    //!AVAIL THE APPLICATION ROUTES
		    this.getRoutes = function( success_callback , error_callback ){
		              
		        $.getJSON("../config/app-routes.json", function( data ){
		            success_callback(data);
		        });
		        
		    };
		      
		    //! BASIC RESPONSE FORMATTER
		    this.makeResponse = function( response, message, command ){
		        
		        return {
		            response: response,
		            data: {
		                message: message,
		                command: command
		            }
		        };
		        
		    };
		    
		        
		    //* MONTHS ARRAY
		    var $month_array = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		    
		   //! HANDLE APPLICATION NATIVE SERVICE REQUESTS
		   this.ajax =function( path , data, success_callback, error_callback , config ){ 
			   
		      //$http.post( bix_hlink + path, data, config).then( success_callback, error_callback );
		      $.ajax({
		            method: "POST",
		            url: this.hlink + path,
		            data: data,
		            success: success_callback,
		            error: success_callback  
		        });
		       /*,
		            error: error_callback      */
		      
		   };
		   
		   //!HANDLE CROSS ORIGIN APPLICATION SERVICE REQUESTS
		   this.cors = function( link , data, success_callback, error_callback , config ){ 
			   
		      //$http.post( link, data, config).then( success_callback, error_callback );
		       $.ajax({
		            method: "POST",
		            url: link,
		            data: data,
		            success: success_callback,
		            error: success_callback   
		        });
		       
		        /*,
		            error: error_callback      */
		   };  
		   
		   //!HANDLE JSON REQUESTS OF ANY CALIBER
		   this.getJSON = function( link, callback_function ){
		       
		       $.getJSON( link, function( response ){
		           callback_function(response);
		       });
		       
		   };
		   
		   
		   //!HANDLE JSON REQUESTS OF ANY CALIBER
		   this.JSON = function( link ){
		       
		       return $.getJSON( link );
		       
		   };
		   
		   //! HANDLE CORS CALLS TO THE PHP FCGI MODULE
		   this.cgi = ( url, data ) => {
		       
		      return $.ajax({
		                method: "GET",
		                url: url,
		                data: data,
		                dataType: 'jsonp',
		            });
		       
		   }
		  
		   //!HANDLE THE DISPLAY OF DIALOG BOXES
		   
		   //* SHOW A "LOADING" ELEMENT
		   this.loadify = function( el ){
		       
		       el.html('<ion-spinner icon="lines" class="spinner-energized"></ion-spinner>');
		       
		   };
		   
		   //*GENERATE A CUSTOM ALERT DIALOG
		   this.alert = function( title ,message, cb ,ok ) {
		       
		        var alertPopup = $ionicPopup.alert({
		            
		            title: title,
		            template: message,
		            okText: ok || "OK"
		            /*cssClass: '', // String, The custom CSS class name
		            subTitle: '', // String (optional). The sub-title of the popup.
		            templateUrl: '', // String (optional). The URL of an html template to place in the popup   body.
		            okType: '', // String (default: 'button-positive'). The type of the OK button.*/
		            
		        });
		       
		        alertPopup.then(function(res) {
		            
		            if( typeof(cb) == "function"){
		                cb(res);
		            }
		            
		        });
		       
		    };
		    
		   //*GENERATE A CUSTOM CONFIRM DIALOG
		   this.confirm = function( title ,message, success_cb, error_cb ) {
		       
		       var confirmPopup = $ionicPopup.confirm({
		         title: title,
		         template: message
		       });
		       
		       confirmPopup.then(function(res) {
		           
		         if(res) {
		             
		            success_cb(res);
		             
		         } else {
		             
		            if(error_cb){
		                error_cb(res);
		            }else{
		                success_cb(res);
		            }
		            
		         }
		           
		       });
		       
		    };    
		    
		    //*GENERATE A CUSTOM PROMPT DIALOG
		    this.prompt = function( title, message, i_type, i_pholder, cb ){
		        
		         $ionicPopup.prompt({
		           title: title,
		           template: message,
		           inputType: i_type,
		           inputPlaceholder: i_pholder
		         }).then(cb);
		        
		    };
		    
		    
		    //!BASIC VALIDATION METHODS
		    
		    //*VALIDATE EMAIL ADDRESSES
		    this.isemail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/;
		    this.isEmail = function( prospective_email ){
		      
		        return this.isemail.test( prospective_email );
		        
		    };
		    
		    //*VALIDATE USERNAMES
		    this.isusername= /^[a-z0-9_-]{4,16}$/;
		    this.isUsername= function( prospective_username ){
		        
		        return this.isusername.test( prospective_username );
		        
		    };    
		    
		    
		    //*VALIDATE PASSWORDS
		    
		    this.ispassword = /^[-@./\!\$\%\^|#&,+\w\s]{6,50}$/;
		    
		    this.isPassword = function( prospective_password ){
		        
		        return this.ispassword.test( prospective_password );
		        
		    };


		    //*VALIDATE TELEPHONE NUMBERS

		    this.istelephone = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
		    this.isTelephone = function( prospective_telephone ){

			return this.istelephone.test( prospective_telephone );

		    }
		    
		    //*VALIDATE WHETHER TWO GIVEN VALUES MATCH
		    this.matches = function( val1, val2 ){
		        
		        return ( val1 === val2 );
		        
		    };
		    
		    //*TRANFORM NUMBER TO MONTH
		    this.num2month = function( month_number ){
		        
		        if( !isNaN(month_number) ){
		            
		            return $month_array[month_number];
		            
		        }else{
		            return "Invalid Month";
		        }
		        
		    }; 
		    
		    //*REMOVE DUPLICATES FROM ARRAY
		    this.unique = function (array_ ){
		        
		        var ret_array = new Array();
		        
		        for (var a = array_.length - 1; a >= 0; a--) {
		            
		            for (var b = array_.length - 1; b >= 0; b--) {
		                
		                if(array_[a] == array_[b] && a != b){
		                    
		                    delete array_[b];
		                    
		                }
		                
		            };
		            
		            if(array_[a] != undefined)
		                
		                ret_array.push(array_[a]);
		            
		        };
		        
		        return ret_array.reverse();
		        
		    };
		    
		    //* COUNT OCCURANCES IN AN ARRAY
		    this.count = function( val, obj ){
		      
		        var cnt = 0;
		      
		        for( v in obj ){
		            if( val === obj[v] ){
		                cnt +=1;
		            }
		        }
		        return cnt;
		        
		    };
		    
		    
		    //* CONDITIONALLY TRANSFORM TO STRING
		    this.str = function( obj ){
		        return  ( typeof(obj) === "object" ) ? JSON.stringify(obj) : obj ;
		    };
		    
		     //* CONDITIONALLY TRANSFORM TO JSON
		    this.json = function( obj ){
		        return ( typeof(obj) === 'object' ) ? obj : JSON.parse( obj );
		    };
		           
		}])

	.controller("appController", ['app','$scope','$location','$rootScope','$ionicSideMenuDelegate','$ionicSlideBoxDelegate',function( app, $scope, $location, $rootScope, $ionicSideMenuDelegate, $ionicSlideBoxDelegate ){
    
		    //!APPLICATION GLOBAL SCOPE COMPONENTS
		    $scope.current  = {};
		    $scope.ui       = {};
		    
		    $rootScope.nav = [];
		    //$rootScope.nav.search; 
		    $rootScope.links = [];
		    
		    $scope.nav.hasFilters = false;

		    //  && ( link.parent == 'false' || ( auth.mainAdmin != null  && auth.mainAdmin != undefined ) )
		    
		    //** MANAGE THE SIDENAV TOGGLE EVENTS
		    //!Right sidenav
		    $scope.nav.right = {};
		    $scope.nav.right.toggle = function(){
		        $ionicSideMenuDelegate.toggleRight();
		    }
		    
		    //!Left sidenav
		    $scope.nav.left = {};
		    $scope.nav.left.toggle = function(){
		        $ionicSideMenuDelegate.toggleLeft();
		    }
		    
		    //** MANAGE THE NAVIGATION SEARCH STATUS
		    $scope.openFilters = function(hasFilters){
		        if(hasFilters === true) { $scope.nav.hasFilters = false; }else{ $scope.nav.hasFilters = true; }
		    };
		    
		    //!INITIALIZE THE APPLICATION ROUTES
		    var setRoutes = function(data){
		        $scope.links = data;
		        //console.dir( $scope.nav )
		    };
		    
		    //!INITIALIZE THE APPLICATION DATA
		    var setData = function(data){
		        $scope.nav = data;
		        //console.dir( $scope.links )
		    };
		    
		    //!FETCH THE NECESSARY APPLICATION DATA
		    $scope.app.getData(setData);
		    $scope.app.getRoutes(setRoutes);  
		    
		    
		    //!RE-INITIALIZE APPLICATION DATA
		    $rootScope.app.reinit = function(){
		      $scope.location.path("/scrum");  
		    };
		    
		    //!MOVE TO THE NEXT SLIDE
		    $rootScope.app.navSlide =  function(index){
					$ionicSlideBoxDelegate.slide(index,500);
			};
		        
		    //!ESTABLISH APPLICATION UI COMPONENTS AND THEIR HANDLERS
		        
		    //*CALL A CUSTOM MODAL
		    $scope.ui.modal = function( modal_template, modal_animation, modal_onHide, modal_onRemove ){
		      console.dir("started")
		        modal_template = modal_template || "views/login.html";
		        
		        //~ Setup the custom modal
		        $ionicModal.fromTemplateUrl( modal_template , {
		            
		            scope: $scope,
		            animation: modal_animation || 'slide-in-up'
		            
		        })
		        .then(function(modal) {
		            
		            $scope.current.modal = modal;
		            
		        });
		        
		        //~ Handle display of the modal
		        $scope.current.openModal = function() {
		            
		            $scope.current.modal.show();
		            
		        };
		        
		       //~ Handle closure of the modal
		       $scope.current.closeModal = function() {
		           
		            $scope.current.modal.hide();
		           
		       };
		      
		       //~ Destroy the modal after use
		       $scope.$on('$destroy', function() {
		           
		            $scope.current.modal.remove();
		           
		       });
		          
		       //~ Perform an action on modal hide
		       $scope.$on('current.modal.hidden', modal_onHide);
		        
		       //~ Perform an action on modal removal
		       $scope.$on('current.modal.removed',modal_onRemove);
		        
		    };
		    //*EO - CALL CUSTOM MODAL 
		    
		    //@ FUNCTION EXECUTOR
		    $rootScope.exec = f=>f();    
		    
		    /**
		     * SECURE THE PARENTAL CONTROLLED URLS
		     */
		    $rootScope.secure = ( securityFunc )=>{
		        
		        var parts = window.location.href.split('/');
		        var part = parts[(parts.length-1)];
		        if( $scope.links.indexOf(part) >= 0  ){
		            
		          $rootScope.exec( securityFunc ); 
		            
		        }
		        
		        
		    }

		    $scope.logout = () => {
		        $scope.logedin = false;
		        delete $scope.storage.user;
		        window.location = '/#/';
		    };
		 
		    
		}])