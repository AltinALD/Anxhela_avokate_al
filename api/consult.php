<?php
/**
 * Consultation form handler for Anxhela Lami Law Firm
 * Saves requests to data/consultations.json and optionally sends email
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda e lejuar: POST']);
    exit;
}

$required = ['emri', 'mbiemri', 'telefon', 'sherbimi', 'menyra', 'mesazhi'];
$data = [];

foreach ($required as $field) {
    $value = trim($_POST[$field] ?? '');
    if ($value === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fusha "' . $field . '" është e detyrueshme.']);
        exit;
    }
    $data[$field] = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

$optional = ['email', 'data', 'ora'];
foreach ($optional as $field) {
    $data[$field] = htmlspecialchars(trim($_POST[$field] ?? ''), ENT_QUOTES, 'UTF-8');
}

$data['timestamp'] = date('Y-m-d H:i:s');
$data['ip'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Save to JSON file
$dataDir = dirname(__DIR__) . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$file = $dataDir . '/consultations.json';
$consultations = [];

if (file_exists($file)) {
    $consultations = json_decode(file_get_contents($file), true) ?? [];
}

$consultations[] = $data;

if (file_put_contents($file, json_encode($consultations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gabim në ruajtjen e të dhënave.']);
    exit;
}

// Optional: send email notification (configure below)
$notifyEmail = 'info@anxhelalami.al'; // Change to real email
$subject = 'Kërkesë e re për konsultim — ' . $data['emri'] . ' ' . $data['mbiemri'];
$body = "Kërkesë e re për konsultim online\n\n"
      . "Emri: {$data['emri']} {$data['mbiemri']}\n"
      . "Telefon: {$data['telefon']}\n"
      . "Email: {$data['email']}\n"
      . "Shërbimi: {$data['sherbimi']}\n"
      . "Mënyra: {$data['menyra']}\n"
      . "Data: {$data['data']}\n"
      . "Ora: {$data['ora']}\n\n"
      . "Mesazhi:\n{$data['mesazhi']}\n\n"
      . "Data/Ora: {$data['timestamp']}";

@mail($notifyEmail, $subject, $body, "From: noreply@anxhelalami.al\r\nContent-Type: text/plain; charset=UTF-8");

echo json_encode([
    'success' => true,
    'message' => 'Kërkesa u dërgua me sukses. Do t\'ju kontaktojmë së shpejti.'
]);
