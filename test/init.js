var test_db =  'postgres://uixujjdbrwbeel:cTlKQsO0DrANXBuuj1bsZv_MU-@ec2-54-217-202-109.eu-west-1.compute.amazonaws.com:5432/d9ioj4l3gj566j?ssl=true';

process.env.DATABASE_URL = process.env.TEST_DB_URL || test_db;


    
