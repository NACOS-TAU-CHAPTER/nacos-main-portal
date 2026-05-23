<?php

echo "<pre>";
print_r($_POST);
echo "</pre>";

include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $fields = [

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

    foreach ($fields as $field) {

        $candidate = trim($_POST[$field]);

        $amount = intval($_POST[$field . '-amount']);

        if (!$candidate || $amount < 1) {
            continue;
        }

        // Check if candidate already exists in same category
        $check = "
            SELECT * FROM votes
            WHERE
            category='$field'
            AND
            candidate_name='$candidate'
        ";

        $result = $conn->query($check);

        if ($result->num_rows > 0) {

            // Update vote count
            $update = "
                UPDATE votes
                SET votes = votes + $amount
                WHERE
                category='$field'
                AND
                candidate_name='$candidate'
            ";

            $conn->query($update);

        } else {

            // Insert new candidate
            $insert = "
                INSERT INTO votes(
                    category,
                    candidate_name,
                    votes
                )

                VALUES(
                    '$field',
                    '$candidate',
                    $amount
                )
            ";

            $conn->query($insert);

        }

    }

    header("Location: index.html#evoting");

}

?>