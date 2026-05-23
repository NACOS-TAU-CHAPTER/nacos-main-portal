<?php

include 'db.php';

$categories = [
    'tech-innovator' => 'Tech Innovator of the year',
    'faculty-icon' => 'Faculty Icon of the year',
    'sportsman' => 'Sportsman of the Year',
    'course-rep' => 'Best Course Representative',
    'best-dressed-male' => 'Best Dressed Male of the Faculty',
    'best-dressed-female' => 'Best Dressed Female of the Faculty',
    'best-lecturer' => 'Best Lecturer of the year',
    'most-influential' => 'Most Influential',
    'outstanding-executive' => 'Outstanding Executive of the year',
    'most-popular' => 'Most Popular Figure'
];

$category = isset($_GET['category']) ? $_GET['category'] : 'tech-innovator';

if (!array_key_exists($category, $categories)) {
    $category = 'tech-innovator';
}

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
$data = array();

while($row = $result->fetch_assoc()) {
    $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode([
    'category' => $categories[$category],
    'categoryId' => $category,
    'candidates' => $data,
    'categories' => $categories
]);

?>
