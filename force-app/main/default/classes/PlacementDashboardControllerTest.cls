@IsTest
private class PlacementDashboardControllerTest {

    @TestSetup
    static void createTestData() {

        // Create Student
        Student__c student = new Student__c(
            Name = 'Test Student',
            Enrollment_Number__c = 'TEST2026001',
            Email__c = 'teststudent@example.com',
            Graduation_Year__c = 2027,
            CGPA__c = 8.5,
            Branch__c = 'Computer Science Engineering'
        );

        insert student;

        // Create Job Opportunities
        // Student CGPA = 8.5

        // Eligible because 8.5 >= 7.0
        Job_Opportunity__c opportunity1 = new Job_Opportunity__c(
            Name = 'Test Software Developer',
            Required_CGPA__c = 7.0
        );

        // Eligible because 8.5 >= 8.0
        Job_Opportunity__c opportunity2 = new Job_Opportunity__c(
            Name = 'Test Java Developer',
            Required_CGPA__c = 8.0
        );

        // Not Eligible because 8.5 < 9.0
        Job_Opportunity__c opportunity3 = new Job_Opportunity__c(
            Name = 'Test Data Scientist',
            Required_CGPA__c = 9.0
        );

        insert new List<Job_Opportunity__c>{
            opportunity1,
            opportunity2,
            opportunity3
        };

        // Create Job Applications

        // Application 1 → Eligible
        Job_Application__c application1 = new Job_Application__c(
            Student__c = student.Id,
            Job_Opportunity__c = opportunity1.Id,
            Application_Status__c = 'Applied',
            Eligibility_Status__c = 'Eligible',
            Interview_Result__c = 'Pending',
            Interview_Date__c = Date.today().addDays(-8),
            Application_Date__c = Date.today().addDays(-10)
        );

        // Application 2 → Eligible + Selected
        Job_Application__c application2 = new Job_Application__c(
            Student__c = student.Id,
            Job_Opportunity__c = opportunity2.Id,
            Application_Status__c = 'Selected',
            Eligibility_Status__c = 'Eligible',
            Interview_Result__c = 'Selected',
            Interview_Date__c = Date.today().addDays(-3),
            Application_Date__c = Date.today().addDays(-5)
        );

        // Application 3 → Not Eligible + Rejected
        Job_Application__c application3 = new Job_Application__c(
            Student__c = student.Id,
            Job_Opportunity__c = opportunity3.Id,
            Application_Status__c = 'Rejected',
            Eligibility_Status__c = 'Not Eligible',
            Interview_Result__c = 'Rejected',
            Interview_Date__c = Date.today().addDays(-1),
            Application_Date__c = Date.today().addDays(-2)
        );

        insert new List<Job_Application__c>{
            application1,
            application2,
            application3
        };
    }


    @IsTest
    static void testGetStudents() {

        Test.startTest();

        List<Student__c> students =
            PlacementDashboardController.getStudents();

        Test.stopTest();

        System.assertEquals(1, students.size());
        System.assertEquals('Test Student', students[0].Name);
        System.assertEquals(8.5, students[0].CGPA__c);
        System.assertEquals(
            'Computer Science Engineering',
            students[0].Branch__c
        );
    }


    @IsTest
    static void testGetTotalApplications() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        Integer total =
            PlacementDashboardController.getTotalApplications(student.Id);

        Test.stopTest();

        System.assertEquals(3, total);
    }


    @IsTest
    static void testGetEligibleApplications() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        Integer eligible =
            PlacementDashboardController.getEligibleApplications(student.Id);

        Test.stopTest();

        System.assertEquals(2, eligible);
    }


    @IsTest
    static void testGetSelectedApplications() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        Integer selected =
            PlacementDashboardController.getSelectedApplications(student.Id);

        Test.stopTest();

        System.assertEquals(1, selected);
    }


    @IsTest
    static void testGetRejectedApplications() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        Integer rejected =
            PlacementDashboardController.getRejectedApplications(student.Id);

        Test.stopTest();

        System.assertEquals(1, rejected);
    }


    @IsTest
    static void testGetStudentDetails() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        Student__c result =
            PlacementDashboardController.getStudentDetails(student.Id);

        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(student.Id, result.Id);
        System.assertEquals('Test Student', result.Name);
        System.assertEquals(8.5, result.CGPA__c);
        System.assertEquals(
            'Computer Science Engineering',
            result.Branch__c
        );
    }


    @IsTest
    static void testGetStudentApplications() {

        Student__c student = [
            SELECT Id
            FROM Student__c
            WHERE Name = 'Test Student'
            LIMIT 1
        ];

        Test.startTest();

        List<Job_Application__c> applications =
            PlacementDashboardController.getStudentApplications(student.Id);

        Test.stopTest();

        System.assertEquals(3, applications.size());

        for (Job_Application__c application : applications) {

            System.assertNotEquals(null, application.Id);
            System.assertNotEquals(null, application.Name);

            System.assertNotEquals(
                null,
                application.Job_Opportunity__r
            );

            System.assertNotEquals(
                null,
                application.Job_Opportunity__r.Name
            );

            System.assertNotEquals(
                null,
                application.Application_Status__c
            );

            System.assertNotEquals(
                null,
                application.Eligibility_Status__c
            );

            System.assertNotEquals(
                null,
                application.Application_Date__c
            );
        }
    }
}