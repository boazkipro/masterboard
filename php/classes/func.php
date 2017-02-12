<?php

include_once 'dbconf.php';

function connect(){
    mysql_connect(DB_HOST, DB_USER, DB_PASS) or die('Could not connect to server!' . mysql_error());
    mysql_select_db(DB_NAME);
}

function close(){
    mysql_close();
}

function query(){
    $myData = mysql_query("SELECT * FROM positions");
    while($record = mysql_fetch_array($myData)){
        echo '<option value="' . $record['id'] . '">' . $record['title'] . '</option>';   
    }
}

function dep_query(){
    $myData = mysql_query("SELECT * FROM departments ORDER BY title");
    while($record = mysql_fetch_array($myData)){
        echo '<option value="' . $record['id'] . '">' . $record['title'] . '</option>';   
    }
}
?>
