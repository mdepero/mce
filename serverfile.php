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

	if($_REQUEST['get'] == "buildInitialReviewForm"){
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


	    $return .= '"Semesters": [';


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


	    $return .= "] }";

	    echo $return;

	}

	if($_REQUEST['get'] == "addClassList"){

		$return = '{"Classes": {';

	    // Create List of Classes from professor and semester [2]
	    $sql = "SELECT c.ID,cl.ShortName,cl.LongName FROM  mce_class c left join mce_tl_classlist cl on c.ClassTypeID = cl.ID where FacultyID = '".$_REQUEST['v1']."' and Semester = '".$_REQUEST['v2']."' order by cl.ShortName";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'. $row['ID'] .'": "'.$row['ShortName'].' - '.$row['LongName'].'"';

	    }

	    $return .= "} }";

	    echo $return;

	}


	if($_REQUEST['get'] == "addStudents"){

		$return = '[';

		$classIDs = json_decode($_REQUEST['v1']);

		$firstClass = true;

		foreach($classIDs as $classID){

			if($firstClass)
				$firstClass = false;
			else
				$return .= ', ';

			$sql = "SELECT c.ID,cl.ShortName,cl.LongName FROM  mce_class c left join mce_tl_classlist cl on c.ClassTypeID = cl.ID where c.ID = ".$classID;
		    $result = mysqli_query($conn, $sql);
		    $row = mysqli_fetch_assoc($result);

			$return .= '{"Class": {"Name": "'.$row['ShortName'].' - '.$row['LongName'].'","ID":"'.$row['ID'].'"},"Students": {';

		    // Create List of students in each class [3]
		    $sql = "SELECT s.ID,s.LastName,s.FirstName FROM mce_student s where EXISTS( SELECT * FROM mce_class c where c.ID = '".$classID."' and c.StudentList LIKE CONCAT('%',s.ID,'%')) order by s.LastName asc";
		    $result = mysqli_query($conn, $sql);
		    $first = true;
		    while($row = mysqli_fetch_assoc($result)){
		    	if($first == true)
		    		$first = false;
		    	else
		    		$return .= ", ";
		    	$return .= '"'. $row['ID'] .'": "'.$row['LastName'].', '.$row['FirstName'].'"';

		    }

		    $return .= '} }';

		}

	    $return .= ']';

	    echo $return;

	}

}


?>