<?php
	header("Access-Control-Allow-Origin: *");
?>

<?php
	$fileName = $_POST["logFile"];
	echo "open file\n";
	$datei = fopen('../../logs/'.$fileName, "a");

	echo "write file\n";
	fwrite($datei, $_POST["logText"]);
	
	echo "close file\n";
	fclose($datei);
	
	echo "end of php\n";
?>
