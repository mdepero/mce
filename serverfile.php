<?PHP

/* This file is to be placed on the server to store and send the data being used to control the screen
 *
 * All Code by Matt DePero
 */

header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");


if(isset($_REQUEST['set'])){
	$myfile = fopen("data.txt", "w") or die("Unable to open file!");
	$data = $_GET["set"];
	fwrite($myfile, $data);
	fclose($myfile);
}

if(isset($_REQUEST['get'])){
	$myfile = fopen("data.txt", "r") or die("Unable to open file!");
	echo fread($myfile,filesize("data.txt"));
	fclose($myfile);
}


?>