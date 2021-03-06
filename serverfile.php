<?PHP

/* This file is to be placed on the server to store and send the data being used to control the screen
 *
 * All Code by Matt DePero
 */


// Variables

$databaseURL = "107.10.27.126:3306";// no http:// (b/c it's not http idiot)
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
	    $sql = "SELECT c.ID, c.Semester FROM  mce_class c inner join mce_tl_classlist cl on c.ClassTypeID = cl.ID where c.Active = '1' group by c.Semester order by c.ID asc";
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
	    $sql = "SELECT c.ID,cl.ShortName,cl.LongName,c.Section FROM  mce_class c left join mce_tl_classlist cl on c.ClassTypeID = cl.ID where FacultyID = '".$_REQUEST['v1']."' and Semester = '".$_REQUEST['v2']."' and c.Active = '1' order by cl.ShortName asc";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'. $row['ID'] .'": "'.$row['ShortName'].' - '.$row['LongName'].' - '.$row['Section'].'"';

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

			$sql = "SELECT c.ID,c.Section,cl.ShortName,cl.LongName FROM  mce_class c left join mce_tl_classlist cl on c.ClassTypeID = cl.ID where c.ID = ".$classID;
		    $result = mysqli_query($conn, $sql);
		    $row = mysqli_fetch_assoc($result);

			$return .= '{"Class": {"Name": "'.$row['ShortName'].' - '.$row['LongName'].' - '.$row['Section'].'","ID":"'.$row['ID'].'"},"Students": {';

		    // Create List of students in each class [3]
		    $sql = "SELECT s.ID,s.LastName,s.FirstName FROM mce_student s where EXISTS( SELECT * FROM mce_class c where c.ID = '".$classID."' and c.StudentList LIKE CONCAT('%',s.ID,'%')) order by s.LastName asc";
		    $result = mysqli_query($conn, $sql);
		    $first = true;
		    while($row = mysqli_fetch_assoc($result)){
		    	if($first == true)
		    		$first = false;
		    	else
		    		$return .= ", ";



		    	//$return .= '"'. $row['ID'] .'": "'.$row['LastName'].', '.$row['FirstName'].'"';

		    	$sql = "SELECT * FROM mce_review WHERE StudentID ='" . $row['ID'] . "' AND ClassID = '" . $classID . "' AND Active = 1 LIMIT 1";
				$check = mysqli_query($conn, $sql);

			    if(mysqli_num_rows ( $check ) > 0)
			        $return .= '"'. $row['ID'] .'": "&&DISABLE&&'.$row['LastName'].', '.$row['FirstName'].'"';// student already reviewed, add marker
			    else
			    	$return .= '"'. $row['ID'] .'": "'.$row['LastName'].', '.$row['FirstName'].'"';// student not reviwed yet, 

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
		    		die('["ERROR inserting answer"]');
		    	}
	    	}
	    }

	    echo '["Success"]';
	}


	if($_REQUEST['get'] == "deleteReview"){

		$sql = "UPDATE `mce_review` SET `Active` = '0' WHERE `ClassID` = ".$_REQUEST['v1']." AND `StudentID` = ".$_REQUEST['v2'].";";
		$result = mysqli_query($conn, $sql);
		if(!$result){
			die('{"status":"error","message":"failed to update table"}');
		}else{
			die('{"status":"success","classID":"'.$_REQUEST['v1'].'","studentID":"'.$_REQUEST['v2'].'"}');
		}

	}






// =========================================================== Read Reviews =========================================================
	// =========================================================================================================



	if($_REQUEST['get'] == "getReviews"){
		// Return the set of all reviews

		// array of students, each student array of reviews, each review array of answers

echo "Confidential Information, contact matt for access to review data";

/*
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

	    	$return .= '{"Question": "'.str_replace('"', '\"', $row['Question']).'", "Value": "'.$row['Value'].'"}';


	    	$review = $row["ReviewID"];
	    	$student = $row["StudentID"];

	    }

	    $return .= "]}]} ]";

	    echo $return;
*/


	}// end getReviews




	if($_REQUEST['get'] == "getSemesterList"){

		$return = '[';

	    $sql = "SELECT Semester FROM  mce_class where Active = '1' GROUP BY Semester";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	$return .= '"'.$row['Semester'].'"';

	    }

	    $return .= "]";

	    echo $return;


	}// end getSemester




	if($_REQUEST['get'] == "getStudentListForSemester"){

		$return = '[';

	    $sql = "SELECT * FROM  mce_student s where Active = '1' AND EXISTS (SELECT * FROM mce_class WHERE Active = '1' AND Semester = '".$_REQUEST['v1']."' AND StudentList LIKE CONCAT('%', s.ID, '%') ) ORDER BY LastName";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";


	    	$sql = "SELECT a.Value FROM mce_answer a LEFT JOIN mce_review r on a.ReviewID = r.ID LEFT JOIN mce_class c on r.ClassID = c.ID WHERE c.Semester = '".$_REQUEST['v1']."' AND r.StudentID = '".$row['ID']."'";
	    	$countQuery = mysqli_query($conn, $sql);
	    	$sum = 0;
	    	$count = 0;
	    	while($queryData = mysqli_fetch_assoc($countQuery)){

	    		if(is_int($queryData['Value'])){
	    			$sum += $queryData['Value'];
	    			$count++;
	    		}

	    	}

	    	if($count == 0)
	    		$avg = "No Reviews Yet";
	    	else
	    		$avg = (($sum*1.00)/$count);


	    	$return .= '{"StudentID": "'. $row['ID'] .'", "FirstName": "'.$row['FirstName'].'", "LastName": "'.$row['LastName'].'", "Major": "'.$row['Major'].'", "Average":"'.$avg.'"}';

	    }

	    $return .= "]";

	    echo $return;


	}// end getFullStudentList



	if($_REQUEST['get'] == "getStudentReport"){

		$return = '{"StudentID":"'.$_REQUEST['v2'].'", "Reviews":[';


	    $sql = "SELECT r.ID, r.DateReviewed, c.Section, cl.ShortName, cl.LongName, f.FirstName, f.LastName FROM mce_review r LEFT JOIN mce_class c on r.ClassID = c.ID LEFT JOIN mce_tl_classlist cl on c.ClassTypeID = cl.ID LEFT JOIN mce_faculty f on c.FacultyID = f.ID where r.StudentID = '".$_REQUEST['v2']."' AND c.Semester = '".$_REQUEST['v1']."' ORDER BY cl.ShortName ASC";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";

	    	$sql = "SELECT a.Value FROM mce_answer a LEFT JOIN mce_review r on a.ReviewID = r.ID  WHERE r.ID = '".$row['ID']."'";
	    	$countQuery = mysqli_query($conn, $sql);
	    	$sum = 0;
	    	$count = 0;
	    	while($queryData = mysqli_fetch_assoc($countQuery)){

	    		if(is_int($queryData['Value'])){
	    			$sum += $queryData['Value'];
	    			$count++;
	    		}

	    	}

	    	if($count == 0)
	    		$avg = "No Reviews Yet";
	    	else
	    		$avg = (($sum*1.00)/$count);

	    	$return .= '{"ID":"'.$row['ID'].'", "DateReviewed": "'. $row['DateReviewed'] .'", "Faculty_FirstName": "'.$row['FirstName'].'", "Faculty_LastName": "'.$row['LastName'].'", "Section": "'.$row['Section'].'", "Class_ShortName": "'.$row['ShortName'].'", "Class_LongName": "'.$row['LongName'].'", "Average":"'.$avg.'"}';

	    }

	    $return .= "] }";

	    echo $return;


	}// end getFullStudentList




	if($_REQUEST['get'] == "getReviewDetails"){

		$return = '{"ReviewID":"'.$_REQUEST['v1'].'", "Answers":[';

	    $sql = "SELECT a.ID, a.Value, q.Question FROM  mce_answer a LEFT JOIN mce_tl_questionlist q on a.QuestionID = q.ID WHERE ReviewID = '".$_REQUEST['v1']."'";
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";


	    	$return .= '{"ID": "'. $row['ID'] .'", "Value": "'.$row['Value'].'", "Question": "'.$row['Question'].'"}';

	    }

	    $return .= "] }";

	    echo $return;


	}// end getReviewDetails











	// ========================================== ITEM LISTS ADMIN =========================================================
	// =====================================================================================================================



	if($_REQUEST['get'] == "getItemList"){

		$table = $_REQUEST['v1'];

		$return = '[';

	    // Create List of Classes from professor and semester [2]
	    if($table == "class"){
			$sql = "SELECT cl.ShortName, cl.LongName, c.ID, c.Semester, c.Section, f.FirstName, f.LastName FROM  mce_class c LEFT JOIN mce_tl_classlist cl on c.ClassTypeID = cl.ID LEFT JOIN mce_faculty f on c.FacultyID = f.ID WHERE c.Active = 1 ORDER BY cl.ShortName";
	    }else{
	    	$sql = "SELECT * FROM  mce_".$table." WHERE Active = 1";
	    }
	    
	    $result = mysqli_query($conn, $sql);
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first == true)
	    		$first = false;
	    	else
	    		$return .= ", ";
	    	if($table == "faculty")
	    		$return .= '{"Name":"'.$row['FirstName'].' '.$row['LastName'].'", "UniqueID":"'. $row['UniqueID'] .'", "ID":"'.$row['ID'].'"}';
	    	if($table == "tl_classlist")
	    		$return .= '{"ShortName":"'.$row['ShortName'].'","LongName": "'.$row['LongName'].'","ID": "'.$row['ID'].'"}';
	    	if($table == "tl_questionlist")
	    		$return .= '{"Question":"'.$row['Question'].'", "":"", "ID": "'.$row['ID'].'"}';
	    	if($table == "class")
	    		$return .= '{"NOEDIT1":"'.$row['ShortName'].' '.$row['Section'].'", "NOEDIT1.5":"'.$row['Semester'].'", "NOEDIT2":"'.$row['LongName'].'", "NOEDIT3":"'.$row['LastName'].', '.$row['FirstName'].'", "ID": "'.$row['ID'].'"}';

	    }

	    $return .= "]";

	    echo $return;

	}


	if($_REQUEST['get'] == "retireListItem"){

		$vars = json_decode($_REQUEST['v1']);

	    $sql = "UPDATE `mce_db`.`mce_".$vars[2]."` SET `Active` = '0' WHERE `mce_".$vars[2]."`.`ID` = ".$vars[0].";";
	    $result = mysqli_query($conn, $sql);
	    if($result)
	    	echo '["success","'.$vars[1].'"]';
	    else
	    	echo '["ERROR updating item to retired in database"]';;

	}



	if($_REQUEST['get'] == "updateListItem"){

		$vars = json_decode($_REQUEST['v1']);

		if($vars[2] != 'Name')
			$sql = "UPDATE `mce_db`.`mce_".$vars[0]."` SET `".$vars[2]."` = '".$vars[4]."' WHERE `mce_".$vars[0]."`.`ID` = ".$vars[1].";";
		else
			$sql = "UPDATE `mce_db`.`mce_".$vars[0]."` SET `FirstName` = '".explode(' ',trim($vars[4]),2)[0]."', `LastName` = '".explode(' ',trim($vars[4]),2)[1]."' WHERE `mce_".$vars[0]."`.`ID` = ".$vars[1].";";

	    
	    $result = mysqli_query($conn, $sql);
	    if($result)
	    	echo '["success","'.$vars[3].'","'.$vars[4].'"]';
	    else
	    	echo '["ERROR updating item in database, update failed"]';

	}



	if($_REQUEST['get'] == "addListItemReturn"){
		// Adds a list item

		$table = $_REQUEST['v2'];

		$item = json_decode($_REQUEST['v1']);

		// check if list item not already added if duplicates not allowed
		if($table == 'tl_classlist')
			$sql = "SELECT * FROM  mce_".$table." WHERE `ShortName` = '".$item[0]."' AND Active = 1";

		elseif($table == 'tl_questionlist')
			$sql = "SELECT * FROM  mce_".$table." WHERE `Question` = '".$item[0]."' AND Active = 1";
		else
			// for faculty and student tables, or as a default which will return no results and thus not error on duplicates due to no other tables having a UniqueID column
			$sql = "SELECT * FROM  mce_".$table." WHERE `UniqueID` = '".$item[2]."' AND Active = 1";
	    $result = mysqli_query($conn, $sql);

	    if( mysqli_num_rows($result) > 0 ){
	    	die('["error","The item you want to add already exists"]');
	    }

	    $name;

	    if($table == "faculty"){
	   		$sql = "INSERT INTO `mce_db`.`mce_faculty` (`ID`, `FirstName`, `LastName`, `UniqueID`, `Active`) VALUES (NULL, '".$item[0]."', '".$item[1]."', '".$item[2]."', '1');";
	   		$name = $item[0].' '.$item[1];
	    }
	    if($table == "tl_classlist"){
	   		$sql = "INSERT INTO `mce_db`.`mce_tl_classlist` (`ID`, `ShortName`, `LongName`, `Active`) VALUES (NULL, '".$item[0]."', '".$item[1]."', '1');";
	   		$name = $item[0];
	    }
	    if($table == "tl_questionlist"){
	   		$sql = "INSERT INTO `mce_db`.`mce_tl_questionlist` (`ID`, `Question`, `Active`) VALUES (NULL, '".$item[0]."', '1');";
	   		$name = $item[0];
	    }
	    $result = mysqli_query($conn, $sql);
	    if($result)
	    	echo '["success","'.$name.'"]';
	    else
	    	echo '["ERROR inserting item to database"]';
	}





	// ============================= Add class and students at same time =================================================
	// ===================================================================================================================

	if($_REQUEST['get'] == "returnFacultyID"){

	    // Create List of Classes from professor and semester [2]
	    $sql = "SELECT * FROM  mce_faculty WHERE Active = 1 and UniqueID = '".$_REQUEST['v1']."'";
	    $result = mysqli_query($conn, $sql);

	    if( mysqli_num_rows($result) == 0 ){
	    	die('["error","No results found with your UniqueID. Maybe you need to be added as a faculty member in the system?"]');
	    }
	    if( mysqli_num_rows($result) > 1 ){
	    	die('["error","Fatal Error! Multiple active faculty records with same UniqueID. Please report this error to system admin (link should be at the bottom of this site)"]');
	    }

	    $row = mysqli_fetch_assoc($result);
	    echo '["success","'.$row['ID'].'", "'.$row['FirstName'].' '.$row['LastName'].'"]';

	}



	if($_REQUEST['get'] == "getClassListForAddAClass"){
		$sql = "SELECT * FROM  mce_tl_classlist WHERE Active = 1 order by ShortName";
	    $result = mysqli_query($conn, $sql);
	    $ret = "[";
	    $first = true;
	    while($row = mysqli_fetch_assoc($result)){
	    	if($first)
	    		$first = false;
	    	else
	    		$ret .= ', ';
	    	$ret .= '{"ClassTypeID": "'.$row['ID'].'","ShortName":"'.$row['ShortName'].'", "LongName": "'.$row['LongName'].'"}';
	    }
	    $ret .= "]";
	    
	    echo $ret;

	}


	if($_REQUEST['get'] == "setStudentsReturn"){

		$classData = json_decode($_REQUEST['v1'],TRUE);

		// Create List of Classes from professor and semester [2]
	    $sql = "SELECT * FROM  mce_class WHERE Active = 1 and ClassTypeID = '".$classData['ClassTypeID']."' and Section = '".$classData['Section']."' and Semester = '".$classData['Semester']."'";
	    
	    $result = mysqli_query($conn, $sql);

	    if(!$result){
	    	die('["error","Failed to search for class duplicates"]');
	    }

	    if( mysqli_num_rows($result) == 1 ){
	    	die('["error","Error: An instance of this class and section already exists this semester."]');
	    }
	    if( mysqli_num_rows($result) > 1 ){
	    	die('["error","Fatal Error! Multiple classes exist with this course, section, and semester. Please report this error to system admin (link should be at the bottom of this site)"]');
	    }

	    $studentIDs = [];

	    foreach($classData['Students'] as $student){
	    	// Determine if a student is already in the database. If they are, move on. If they aren't, add them.
	    	$sql = "SELECT * FROM  mce_student WHERE Active = 1 and UniqueID = '".$student['UniqueID']."'";
	    	$result = mysqli_query($conn, $sql);
	    	if(!$result){
		    	die('["error","Failed to search for instances of student already in database. UniqueID: '.$student['UniqueID'].'"]');
		    }
	    	if( mysqli_num_rows($result) > 1 ){
	    		die('["error","Fatal Error! A student UniqueID is associated to more than one student: '.$student['UniqueID'].'. Please report this error to system admin (link should be at the bottom of this site)"]');
	    	}
	    	if( mysqli_num_rows($result) == 0 ){
	    		$sql = "INSERT INTO `mce_db`.`mce_student` (`ID`, `FirstName`, `LastName`, `UniqueID`, `Major`, `Active`) VALUES (NULL, '".$student['FirstName']."', '".$student['LastName']."', '".$student['UniqueID']."', '".$student['Major']."', '1');";
	    		$result = mysqli_query($conn, $sql);
	    		if(!$result){
	    			die('["error","Fatal Error! Student '.$student['UniqueID'].' failed to be added to the student database. Check for special characters in their name, etc."]');
	    		}
	    	}


	    	// get the student's ID in the table and add it to the list of student IDs in the class
	    	$sql = "SELECT * FROM  mce_student WHERE Active = 1 and UniqueID = '".$student['UniqueID']."'";
	    	$result = mysqli_query($conn, $sql);
	    	if(!$result){
		    	die('["error","Failed to search for students ID in table. UniqueID: '.$student['UniqueID'].'"]');
		    }
	    	$row = mysqli_fetch_assoc($result);


	    	array_push($studentIDs,$row['ID']);
	    }



	    $sql = "INSERT INTO `mce_db`.`mce_class` (`ID`, `Section`, `ClassTypeID`, `FacultyID`, `StudentList`, `Semester`) VALUES (NULL, '".$classData['Section']."', '".$classData['ClassTypeID']."', '".$classData['FacultyID']."', '".JSON_encode($studentIDs)."', '".$classData['Semester']."');";
	    $result = mysqli_query($conn, $sql);
	    if(!$result){
	    	die('["error","Error: Failed to insert class data into database."]');
	    }else{
	    	echo '["success"]';
	    }

	}





}// end isSet Get


?>