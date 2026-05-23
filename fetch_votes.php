<?php

include 'db.php';

$sql = "
    SELECT
    candidate_name,
    SUM(votes) as total_votes

    FROM votes

    GROUP BY candidate_name

    ORDER BY total_votes DESC
";

$result = $conn->query($sql);

$data = array();

while($row = $result->fetch_assoc()) {

    $data[] = $row;

}

header('Content-Type: application/json');

echo json_encode($data);

?>