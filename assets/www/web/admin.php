<html>
	<body>
		<form action="admin.php" method="post">
			<select name="do">
				<option>stop</option>
				<option>restart</option>
				<option>start</option>
			</select>
			<input type="password" name="password">
			<input type="submit">
		</form>
		<?php
			if ($_POST["password"] == "kittyadminiscoolcat"){
				echo chdir("/home/kat/DrawrServer");
				if ($_POST["do"] == "stop"){
					echo shell_exec("./drawr.sh stop");
				}else if ($_POST["do"] == "restart"){
					echo shell_exec("./drawr.sh restart");
				}else if ($_POST["do"] == "start"){
					echo shell_exec("./drawr.sh start");
				}
			}else{
				echo "invalid pass";
			}
		?>
	</body>
</html>