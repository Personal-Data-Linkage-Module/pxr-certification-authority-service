/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
INSERT INTO pxr_certification_authority.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'root',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "aaa Corporation", "OU": "PXR", "CN": "*" }',
    'XXXXX1', 'YYYYY1', 
    '2020-01-01', '2120-12-31', 
	'TEST',
    null, null, 
    null, null, 
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
INSERT INTO pxr_certification_authority.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'server',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "test-org", "OU": 10001, "CN": "*.---.co.jp" }',
    'XXXXX2', 'YYYYY2', 
    '2020-01-01', '2120-12-31', 
	'TEST',
    null, null, 
    10002, 2, 
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
INSERT INTO pxr_certification_authority.certificate_manage
(
    cert_type, 
    subject, 
    serial_no, finger_print, 
    valid_period_start, valid_period_end, 
    certificate, 
    actor_code, actor_version,
    block_code, block_version,
    is_distributed, is_disabled, created_by, created_at, updated_by, updated_at
    )
values
(
    'client',
    '{ "C": "JP", "ST": "Tokyo", "L": "Minato-ku", "O": "test-org", "OU": 10001, "CN": "*.---.co.jp" }',
    'XXXXX3', 'YYYYY3', 
    '2020-01-01', '2120-12-31', 
	'TEST',
    10001, 1, 
    10002, 2,
    false, false, 'pxr_user', NOW(), 'pxr_user', NOW()
);
