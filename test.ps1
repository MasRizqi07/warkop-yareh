$cus = Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/api/v1/auth/register' -Method Post -Body (@{name='Customer';email='cus2@test.com';password='password'} | ConvertTo-Json) -ContentType 'application/json'
$cusToken = $cus.data.tokens.accessToken
Write-Host 'CUSTOMER TOKEN:' $cusToken

$adm = Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/api/v1/auth/register' -Method Post -Body (@{name='Admin';email='adm2@test.com';password='password'} | ConvertTo-Json) -ContentType 'application/json'
$admId = $adm.data.user.id
Write-Host 'ADMIN ID:' $admId

docker exec aicoo-postgres psql -U postgres -d warkopyareh_db -c "UPDATE ""User"" SET role='ADMIN' WHERE id='$admId';"

$admLog = Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/api/v1/auth/login' -Method Post -Body (@{email='adm2@test.com';password='password'} | ConvertTo-Json) -ContentType 'application/json'
$admToken = $admLog.data.tokens.accessToken
Write-Host 'ADMIN TOKEN:' $admToken

Write-Host '--- CUSTOMER HITS ADMIN ENDPOINT ---'
try {
    Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/api/v1/catalog/products' -Method Post -Headers @{Authorization="Bearer $cusToken"} -Body "{}" -ContentType 'application/json'
} catch {
    Write-Host "STATUS CODE: " $_.Exception.Response.StatusCode
}

Write-Host '--- ADMIN HITS ADMIN ENDPOINT ---'
try {
    Invoke-RestMethod -Uri 'http://localhost:4000/api/v1/api/v1/catalog/products' -Method Post -Headers @{Authorization="Bearer $admToken"} -Body "{}" -ContentType 'application/json'
} catch {
    Write-Host "STATUS CODE: " $_.Exception.Response.StatusCode
}
