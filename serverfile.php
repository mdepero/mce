<?PHP

/* This file is to be placed on the server to store and send the data being used to control the screen
 *
 * All Code by Matt DePero
 */


// Variables

$databaseURL = "107.10.18.206:3306";
$databaseUser = "mce_admin";
$databasePassword = "mce_password";
$databaseName = "mce_db";




header('content-type: application/json; charset=utf-8');
header("access-control-allow-origin: *");


if(isset($_REQUEST['set'])){
	
}

if(isset($_REQUEST['get'])){

	// Connect
	$conn = new mysqli($databaseURL, $databaseUser, $databasePassword, $databaseName);
    if ($conn->connect_error) {
        die("ERROR");
    }

    /** +--------------------------------------+
	 *  |          Student Review Form         |
	 *  +--------------------------------------+
     */

	if($_REQUEST['get'] == "getReviewForm0"){
		// Return list of active faculty options and available class semesters

	    $return = '{"Faculty": {';

	    // Create List of Professors [0]
	    $sql = "SELECT * FROM  mce_faculty where Active = '1'";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'. $row['ID'] .'": "'.$row['FirstName']." ".$row['LastName'].'"';

	    }

	    $return .= "}, ";


	    $return .= '"Semesters": {';


	    // Generate list of active class semesters [1]
	    $sql = "SELECT c.ID, c.Semester FROM  mce_class c inner join mce_tl_classlist cl on c.ClassTypeID = cl.ID where cl.Active = '1' group by c.Semester order by c.ID asc";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'.$row['Semester'].'"';

	    }


	    $return .= "} }";

	    echo $return;/*


	    // Generate List of Classes
		$sql = "SELECT Semester FROM  `mce_class` group by Semester";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'. $row['ID'] .'": "'.$row['FirstName']." ".$row['LastName'].'"';

	    }
	    $return .= "}";




	    echo $return;*/

	}

}


?>