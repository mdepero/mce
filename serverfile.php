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
	    $sql = "SELECT c.ID,cl.ShortName,cl.LongName FROM  mce_class c left join mce_tl_classlist cl on c.ClassTypeID = cl.ID where FacultyID = '".$_REQUEST['v1']."' and Semester = '".$_REQUEST['v2']."' order by cl.ShortName asc";
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

	if($_REQUEST['get'] == "startForms"){
		// Return list of active questions

	    $return = '[';

	    // Create List of Professors [0]
	    $sql = "SELECT * FROM  mce_tl_questionlist where Active = '1'";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '{"ID": "'. $row['ID'] .'", "Question": "'.$row['Question'].'"}';

	    }

	    $return .= "]";

	    echo $return;
	}


	if($_REQUEST['get'] == "sendForm"){

	    // Submit Reviews
	    $allReviews = json_decode($_REQUEST['v1'], TRUE);
	    foreach($allReviews as $review){

	    	$sql = "SELECT AUTO_INCREMENT
				FROM information_schema.tables
				WHERE table_name = 'mce_review'
				AND table_schema = DATABASE( ) ;";
	    	$result = mysqli_query($conn, $sql);
			$data = mysqli_fetch_assoc($result);
			$nextID = $data['AUTO_INCREMENT'];

			// echo "Next Review ID: ".$nextID;

			// echo "StudentID: ".$review[0]["StudentID"];
			
	    	$sql = "INSERT INTO `mce_review` (`ID`, `StudentID`, `ClassID`, `DateReviewed`) VALUES (NULL, '".$review[0]['StudentID']."', '".$review[0]['ClassID']."', CURRENT_TIMESTAMP);";
	    	$result = mysqli_query($conn, $sql);
	    	if(!$result){
	    		die('["ERROR inserting review"]'); // Error messages formatted as JSON objects to ensure no error on front end
	    	}

	    	foreach($review as $answer){

	    		$sql = "INSERT INTO `mce_answer` (`ID`, `ReviewID`, `QuestionID`, `Value`) VALUES (NULL, '".$nextID."', '".$answer["QuestionID"]."', '".$answer["Value"]."');";
	    		$result = mysqli_query($conn, $sql);
		    	if(!$result){
		    		die('["ERROR inserting review"]');
		    	}
	    	}
	    }

	    echo '["Success"]';
	}




	if($_REQUEST['get'] == "getReviews"){
		// Return the set of all reviews

		// array of students, each student array of reviews, each review array of answers

	    $return = '[';

	    // Create List of Professors [0]
	    $sql = "SELECT * FROM  mce_answer as a
	    	LEFT JOIN mce_review as r on a.ReviewID = r.ID
	    	LEFT JOIN mce_student as s on r.StudentID = s.ID
	    	LEFT JOIN mce_tl_questionlist as ql on a.QuestionID = ql.ID
	    	LEFT JOIN mce_class as c on r.ClassID = c.ID
	    	LEFT JOIN mce_tl_classlist as cl on c.ClassTypeID = cl.ID
	    	ORDER BY r.StudentID, a.ReviewID";
	    $result = mysqli_query($conn, $sql);



	    $student = "";
	    $firstStudent = true;
	    $review = "";
	    $firstReview = true;
	    $firstAnswer = true;

	    while($row = mysqli_fetch_assoc($result)){

	    	if($student != $row["StudentID"]){
	    		if($firstStudent)
	    			$firstStudent = false;
	    		else
	    			$return .= ']}]},';

	    		$return .= '{"StudentID": "'.$row['StudentID'].'","Student": "'.$row['FirstName'].' '.$row['LastName'].'", "Reviews":[';

	    		$firstReview = true;

	    	}

	    	if($review != $row["ReviewID"]){
	    		if($firstReview)
	    			$firstReview = false;
	    		else
	    			$return .= ']},';

	    		$return .= '{"ReviewID": "'.$row['ReviewID'].'","DateReviewed": "'.$row['DateReviewed'].'","Class": "'.$row['ShortName'].' - '.$row['LongName'].'", "Answers": [';
	    		$firstAnswer = true;
	    	}
	    	
	    	if($firstAnswer)
	    		$firstAnswer = false;
	    	else
	    		$return .= ', ';

	    	$return .= '"'.str_replace('"', '\"', $row['Question']).'": "'.$row['Value'].'"';


	    	$review = $row["ReviewID"];
	    	$student = $row["StudentID"];

	    }

	    $return .= "]}]} ]";

	    echo $return;
	}

}// end isSet Get


?>