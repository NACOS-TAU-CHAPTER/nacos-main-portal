<?php

include 'db.php';

$categories = [
    'tech-innovator',
    'faculty-icon',
    'sportsman',
    'course-rep',
    'best-dressed-male',
    'best-dressed-female',
    'best-lecturer',
    'most-influential',
    'outstanding-executive',
    'most-popular'
];

$allData = array();

foreach ($categories as $category) {
    $sql = "
        SELECT 
            candidate_name, 
            votes
        FROM votes
        WHERE category = '$category'
        ORDER BY votes DESC
        LIMIT 10
    ";
    
    $result = $conn->query($sql);
    $candidates = array();
    
    while($row = $result->fetch_assoc()) {
        $candidates[] = $row;
    }
    
    $allData[$category] = $candidates;
}

header('Content-Type: application/json');
echo json_encode($allData);

?>
