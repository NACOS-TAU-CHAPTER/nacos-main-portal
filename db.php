<?php

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "nacos_voting"
);

if ($conn->connect_error) {

    die("Connection failed: " . $conn->connect_error);

}

?>