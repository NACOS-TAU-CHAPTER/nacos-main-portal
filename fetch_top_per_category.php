<?php

include 'db.php';

$categories = [
    'tech-innovator' => 'Tech Innovator',
    'faculty-icon' => 'Faculty Icon',
    'sportsman' => 'Sportsman',
    'course-rep' => 'Course Rep',
    'best-dressed-male' => 'Best Dressed Male',
    'best-dressed-female' => 'Best Dressed Female',
    'best-lecturer' => 'Best Lecturer',
    'most-influential' => 'Most Influential',
    'outstanding-executive' => 'Outstanding Executive',
    'most-popular' => 'Most Popular'
];

$data = array();

foreach ($categories as $categoryId => $categoryLabel) {
    $sql = "
        SELECT 
            candidate_name, 
            votes
        FROM votes
        WHERE category = '$categoryId'
        ORDER BY votes DESC
        LIMIT 1
    ";
    
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $data[] = [
            'category' => $categoryLabel,
            'candidate_name' => $row['candidate_name'],
            'votes' => $row['votes']
        ];
    } else {
        $data[] = [
            'category' => $categoryLabel,
            'candidate_name' => 'No votes yet',
            'votes' => 0
        ];
    }
}

header('Content-Type: application/json');
echo json_encode($data);

?>
