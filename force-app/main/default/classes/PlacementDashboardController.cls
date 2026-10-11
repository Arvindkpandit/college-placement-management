public with sharing class PlacementDashboardController {

    @AuraEnabled(cacheable=true)
    public static List<Student__c> getStudents() {

        return [
            SELECT Id, Name, CGPA__c, Branch__c
            FROM Student__c
            ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getTotalApplications(Id studentId) {

        return [
            SELECT COUNT()
            FROM Job_Application__c
            WHERE Student__c = :studentId
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getEligibleApplications(Id studentId) {

        return [
            SELECT COUNT()
            FROM Job_Application__c
            WHERE Student__c = :studentId
            AND Eligibility_Status__c = 'Eligible'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getSelectedApplications(Id studentId) {

        return [
            SELECT COUNT()
            FROM Job_Application__c
            WHERE Student__c = :studentId
            AND Application_Status__c = 'Selected'
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getRejectedApplications(Id studentId) {

        return [
            SELECT COUNT()
            FROM Job_Application__c
            WHERE Application_Status__c = 'Rejected'
            AND Student__c = :studentId
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Student__c getStudentDetails(Id studentId) {

        return [
            SELECT Id, Name, CGPA__c, Branch__c
            FROM Student__c
            WHERE Id = :studentId
            LIMIT 1
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Job_Application__c> getStudentApplications(Id studentId) {

        return [
            SELECT Id,
                Name,
                Job_Opportunity__r.Name,
                Application_Status__c,
                Eligibility_Status__c,
                Interview_Result__c,
                Application_Date__c
            FROM Job_Application__c
            WHERE Student__c = :studentId
            ORDER BY Application_Date__c DESC
        ];
    }
}