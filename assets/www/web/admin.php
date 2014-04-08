<html>
	<?php
	if ($_POST["do"] == "start" && $_POST["password"] == "kittyadminiscoolcat"){
		exec("./drawr.sh start");
	}else if ($_POST["do"] == "stop" && $_POST["password"] == "kittyadminiscoolcat"){
		exec("./drawr.sh stop");
	}else if ($_POST["do"] == "restart" && $_POST["password"] == "kittyadminiscoolcat"){
		exec("./drawr.sh restart");
	}
	?>
	<body>
		<form action="admin.php" method="post">
			<select name="do">
				<option>start</option>
				<option>stop</option>
				<option>restart</option>
			</select>
			<input type="password" name="password">
			<input type="submit">
		</form>
	</body>
</html>