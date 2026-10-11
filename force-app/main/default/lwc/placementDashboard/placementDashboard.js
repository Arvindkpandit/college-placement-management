import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getStudents from '@salesforce/apex/PlacementDashboardController.getStudents';
import getStudentDetails from '@salesforce/apex/PlacementDashboardController.getStudentDetails';
import getTotalApplications from '@salesforce/apex/PlacementDashboardController.getTotalApplications';
import getEligibleApplications from '@salesforce/apex/PlacementDashboardController.getEligibleApplications';
import getSelectedApplications from '@salesforce/apex/PlacementDashboardController.getSelectedApplications';
import getRejectedApplications from '@salesforce/apex/PlacementDashboardController.getRejectedApplications';
import getStudentApplications from '@salesforce/apex/PlacementDashboardController.getStudentApplications';

export default class PlacementDashboard extends NavigationMixin(LightningElement) {

    students = [];
    selectedStudentId;

    studentName;
    studentCGPA;
    studentBranch;

    totalApplications = 0;
    eligibleApplications = 0;
    selectedApplications = 0;
    rejectedApplications = 0;

    applications = [];
    filteredApplications = [];

    isLoading = false;

    // Reset confirmation modal
    showResetConfirmation = false;

    // Filters
    searchKey = '';
    selectedApplicationStatus = 'All';
    selectedEligibilityStatus = 'All';

    // Sorting
    sortedBy = 'Application_Date__c';
    sortedDirection = 'desc';

    // Pagination
    pageSize = 5;
    currentPage = 1;

    // Page size options
    pageSizeOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '15', value: '15' },
        { label: '20', value: '20' }
    ];

    // Application status options
    applicationStatusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Applied', value: 'Applied' },
        { label: 'Selected', value: 'Selected' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    // Eligibility status options
    eligibilityStatusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Eligible', value: 'Eligible' },
        { label: 'Not Eligible', value: 'Not Eligible' }
    ];

    // Datatable columns
    columns = [
        {
            label: 'Job Application',
            fieldName: 'Name',
            type: 'button',
            typeAttributes: {
                label: {
                    fieldName: 'Name'
                },
                name: 'view_record',
                variant: 'base'
            }
        },
        {
            label: 'Job Opportunity',
            fieldName: 'jobOpportunity',
            sortable: true
        },
        {
            label: 'Application Status',
            fieldName: 'Application_Status__c',
            sortable: true
        },
        {
            label: 'Eligibility Status',
            fieldName: 'Eligibility_Status__c',
            sortable: true
        },
        {
            label: 'Interview Result',
            fieldName: 'Interview_Result__c',
            sortable: true
        },
        {
            label: 'Application Date',
            fieldName: 'Application_Date__c',
            type: 'date',
            sortable: true
        }
    ];

    connectedCallback() {
        this.loadStudents();
    }

    // ============================================================
    // Student Loading
    // ============================================================

    async loadStudents() {

        try {

            const result = await getStudents();

            this.students = result.map(student => ({
                label: student.Name,
                value: student.Id
            }));

        } catch (error) {

            console.error('Error loading students:', error);

            this.showErrorToast(
                'Error Loading Students',
                error
            );
        }
    }

    async handleStudentChange(event) {

        this.selectedStudentId = event.detail.value;

        this.currentPage = 1;

        this.clearFiltersWithoutToast();

        // Clear old application data while new data loads
        this.applications = [];
        this.filteredApplications = [];

        try {

            await this.loadAllDashboardData();

        } catch (error) {

            console.error(
                'Error loading selected student:',
                error
            );
        }
    }

    // ============================================================
    // Dashboard Loading
    // ============================================================

    async loadAllDashboardData() {

        if (!this.selectedStudentId) {
            return;
        }

        this.isLoading = true;

        try {

            await Promise.all([
                this.loadStudentDetails(),
                this.loadDashboardData(),
                this.loadStudentApplications()
            ]);

        } catch (error) {

            console.error(
                'Error loading dashboard data:',
                error
            );

            throw error;

        } finally {

            this.isLoading = false;
        }
    }

    async handleRefresh() {

        if (!this.selectedStudentId) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Student Selected',
                    message:
                        'Please select a student before refreshing the dashboard.',
                    variant: 'warning'
                })
            );

            return;
        }

        try {

            await this.loadAllDashboardData();

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Dashboard Refreshed',
                    message:
                        'The latest placement information has been loaded.',
                    variant: 'success'
                })
            );

        } catch (error) {

            console.error(
                'Error refreshing dashboard:',
                error
            );
        }
    }

    // ============================================================
    // Reset Dashboard
    // ============================================================

    handleResetDashboard() {

        this.showResetConfirmation = true;
    }

    handleCancelReset() {

        this.showResetConfirmation = false;
    }

    handleConfirmReset() {

        this.selectedStudentId = null;

        this.studentName = null;
        this.studentCGPA = null;
        this.studentBranch = null;

        this.totalApplications = 0;
        this.eligibleApplications = 0;
        this.selectedApplications = 0;
        this.rejectedApplications = 0;

        this.applications = [];
        this.filteredApplications = [];

        this.searchKey = '';
        this.selectedApplicationStatus = 'All';
        this.selectedEligibilityStatus = 'All';

        this.currentPage = 1;
        this.pageSize = 5;

        this.sortedBy = 'Application_Date__c';
        this.sortedDirection = 'desc';

        this.showResetConfirmation = false;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Dashboard Reset',
                message:
                    'The dashboard has been reset successfully.',
                variant: 'success'
            })
        );
    }

    // ============================================================
    // Student Details
    // ============================================================

    async loadStudentDetails() {

        try {

            const result = await getStudentDetails({
                studentId: this.selectedStudentId
            });

            this.studentName = result.Name;
            this.studentCGPA = result.CGPA__c;
            this.studentBranch = result.Branch__c;

        } catch (error) {

            console.error(
                'Error loading student details:',
                error
            );

            this.showErrorToast(
                'Error Loading Student Details',
                error
            );

            throw error;
        }
    }

    // ============================================================
    // Dashboard Statistics
    // ============================================================

    async loadDashboardData() {

        try {

            const [
                total,
                eligible,
                selected,
                rejected
            ] = await Promise.all([

                getTotalApplications({
                    studentId: this.selectedStudentId
                }),

                getEligibleApplications({
                    studentId: this.selectedStudentId
                }),

                getSelectedApplications({
                    studentId: this.selectedStudentId
                }),

                getRejectedApplications({
                    studentId: this.selectedStudentId
                })
            ]);

            this.totalApplications = total;
            this.eligibleApplications = eligible;
            this.selectedApplications = selected;
            this.rejectedApplications = rejected;

        } catch (error) {

            console.error(
                'Error loading dashboard statistics:',
                error
            );

            this.showErrorToast(
                'Error Loading Dashboard Statistics',
                error
            );

            throw error;
        }
    }

    // ============================================================
    // Job Applications
    // ============================================================

    async loadStudentApplications() {

        try {

            const result = await getStudentApplications({
                studentId: this.selectedStudentId
            });

            this.applications = result.map(application => ({
                ...application,

                jobOpportunity:
                    application.Job_Opportunity__r
                        ? application.Job_Opportunity__r.Name
                        : ''
            }));

            this.currentPage = 1;

            this.applyFilters();

        } catch (error) {

            console.error(
                'Error loading applications:',
                error
            );

            this.showErrorToast(
                'Error Loading Job Applications',
                error
            );

            throw error;
        }
    }

    // ============================================================
    // Error Handling
    // ============================================================

    showErrorToast(title, error) {

        let message =
            'Something went wrong. Please try again.';

        if (
            error &&
            error.body &&
            error.body.message
        ) {
            message = error.body.message;

        } else if (
            error &&
            error.message
        ) {
            message = error.message;
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: 'error'
            })
        );
    }

    // ============================================================
    // Search & Filters
    // ============================================================

    handleSearch(event) {

        this.searchKey = event.target.value;

        this.currentPage = 1;

        this.applyFilters();
    }

    handleApplicationStatusChange(event) {

        this.selectedApplicationStatus =
            event.detail.value;

        this.currentPage = 1;

        this.applyFilters();
    }

    handleEligibilityStatusChange(event) {

        this.selectedEligibilityStatus =
            event.detail.value;

        this.currentPage = 1;

        this.applyFilters();
    }

    handlePageSizeChange(event) {

        this.pageSize =
            Number(event.detail.value);

        this.currentPage = 1;
    }

    applyFilters() {

        const searchText = this.searchKey
            ? this.searchKey.toLowerCase()
            : '';

        this.filteredApplications =
            this.applications.filter(application => {

                const matchesSearch =
                    !searchText ||

                    (
                        application.Name &&
                        application.Name
                            .toLowerCase()
                            .includes(searchText)
                    ) ||

                    (
                        application.jobOpportunity &&
                        application.jobOpportunity
                            .toLowerCase()
                            .includes(searchText)
                    ) ||

                    (
                        application.Application_Status__c &&
                        application.Application_Status__c
                            .toLowerCase()
                            .includes(searchText)
                    ) ||

                    (
                        application.Eligibility_Status__c &&
                        application.Eligibility_Status__c
                            .toLowerCase()
                            .includes(searchText)
                    ) ||

                    (
                        application.Interview_Result__c &&
                        application.Interview_Result__c
                            .toLowerCase()
                            .includes(searchText)
                    );

                const matchesApplicationStatus =
                    this.selectedApplicationStatus === 'All' ||
                    application.Application_Status__c ===
                        this.selectedApplicationStatus;

                const matchesEligibilityStatus =
                    this.selectedEligibilityStatus === 'All' ||
                    application.Eligibility_Status__c ===
                        this.selectedEligibilityStatus;

                return (
                    matchesSearch &&
                    matchesApplicationStatus &&
                    matchesEligibilityStatus
                );
            });

        this.sortData(
            this.sortedBy,
            this.sortedDirection
        );
    }

    handleClearFilters() {

        this.searchKey = '';

        this.selectedApplicationStatus = 'All';

        this.selectedEligibilityStatus = 'All';

        this.currentPage = 1;

        this.applyFilters();

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Filters Cleared',
                message:
                    'All search and filter options have been reset.',
                variant: 'success'
            })
        );
    }

    clearFiltersWithoutToast() {

        this.searchKey = '';

        this.selectedApplicationStatus = 'All';

        this.selectedEligibilityStatus = 'All';

        this.currentPage = 1;

        this.filteredApplications = [
            ...this.applications
        ];

        this.sortData(
            this.sortedBy,
            this.sortedDirection
        );
    }

    // ============================================================
    // Sorting
    // ============================================================

    handleSort(event) {

        const {
            fieldName,
            sortDirection
        } = event.detail;

        this.sortedBy = fieldName;

        this.sortedDirection = sortDirection;

        this.sortData(
            fieldName,
            sortDirection
        );
    }

    sortData(fieldName, direction) {

        const data = [
            ...this.filteredApplications
        ];

        const reverse =
            direction === 'asc'
                ? 1
                : -1;

        data.sort((a, b) => {

            let valueA =
                a[fieldName] || '';

            let valueB =
                b[fieldName] || '';

            valueA =
                typeof valueA === 'string'
                    ? valueA.toLowerCase()
                    : valueA;

            valueB =
                typeof valueB === 'string'
                    ? valueB.toLowerCase()
                    : valueB;

            if (valueA > valueB) {
                return reverse;
            }

            if (valueA < valueB) {
                return -reverse;
            }

            return 0;
        });

        this.filteredApplications = data;
    }

    // ============================================================
    // CSV Export
    // ============================================================

    handleExportCSV() {

        if (
            !this.filteredApplications ||
            this.filteredApplications.length === 0
        ) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Data Available',
                    message:
                        'There are no job applications available to export.',
                    variant: 'warning'
                })
            );

            return;
        }

        const headers = [
            'Job Application',
            'Job Opportunity',
            'Application Status',
            'Eligibility Status',
            'Interview Result',
            'Application Date'
        ];

        const csvRows = [];

        csvRows.push(
            headers.join(',')
        );

        this.filteredApplications.forEach(
            application => {

                const row = [

                    application.Name || '',

                    application.jobOpportunity || '',

                    application.Application_Status__c || '',

                    application.Eligibility_Status__c || '',

                    application.Interview_Result__c || '',

                    application.Application_Date__c || ''
                ];

                const escapedRow =
                    row.map(value => {

                        const stringValue =
                            String(value)
                                .replace(/"/g, '""');

                        return `"${stringValue}"`;
                    });

                csvRows.push(
                    escapedRow.join(',')
                );
            }
        );

        // BOM for Excel compatibility
        const csvContent =
            '\uFEFF' +
            csvRows.join('\n');

        const element =
            document.createElement('a');

        element.setAttribute(
            'href',
            'data:text/csv;charset=utf-8,' +
            encodeURIComponent(csvContent)
        );

        element.setAttribute(
            'download',
            'Job_Applications.csv'
        );

        element.style.display = 'none';

        this.template.appendChild(element);

        element.click();

        element.remove();

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Export Successful',
                message:
                    `${this.filteredApplications.length} job application(s) exported successfully.`,
                variant: 'success'
            })
        );
    }

    // ============================================================
    // Placement Analytics
    // ============================================================

    get eligiblePercentage() {

        if (this.totalApplications === 0) {
            return 0;
        }

        return Math.round(
            (
                this.eligibleApplications /
                this.totalApplications
            ) * 100
        );
    }

    get selectedPercentage() {

        if (this.totalApplications === 0) {
            return 0;
        }

        return Math.round(
            (
                this.selectedApplications /
                this.totalApplications
            ) * 100
        );
    }

    get rejectedPercentage() {

        if (this.totalApplications === 0) {
            return 0;
        }

        return Math.round(
            (
                this.rejectedApplications /
                this.totalApplications
            ) * 100
        );
    }

    get eligibleProgressStyle() {

        return `width: ${this.eligiblePercentage}%`;
    }

    get selectedProgressStyle() {

        return `width: ${this.selectedPercentage}%`;
    }

    get rejectedProgressStyle() {

        return `width: ${this.rejectedPercentage}%`;
    }

    // ============================================================
    // Pagination
    // ============================================================

    get paginatedApplications() {

        const startIndex =
            (this.currentPage - 1) *
            this.pageSize;

        const endIndex =
            startIndex +
            this.pageSize;

        return this.filteredApplications.slice(
            startIndex,
            endIndex
        );
    }

    get totalPages() {

        return Math.ceil(
            this.filteredApplications.length /
            this.pageSize
        );
    }

    get isPreviousDisabled() {

        return this.currentPage === 1;
    }

    get isNextDisabled() {

        return (
            this.currentPage === this.totalPages ||
            this.totalPages === 0
        );
    }

    get pageInfo() {

        if (
            this.filteredApplications.length === 0
        ) {
            return 'Page 0 of 0';
        }

        return `Page ${this.currentPage} of ${this.totalPages}`;
    }

    get applicationCountMessage() {

        const totalRecords =
            this.filteredApplications.length;

        if (totalRecords === 0) {
            return 'Showing 0 Job Applications';
        }

        const startRecord =
            (this.currentPage - 1) *
            this.pageSize +
            1;

        const endRecord =
            Math.min(
                this.currentPage *
                    this.pageSize,
                totalRecords
            );

        return `Showing ${startRecord}-${endRecord} of ${totalRecords} Job Applications`;
    }

    handlePrevious() {

        if (this.currentPage > 1) {
            this.currentPage -= 1;
        }
    }

    handleNext() {

        if (
            this.currentPage <
            this.totalPages
        ) {
            this.currentPage += 1;
        }
    }

    // ============================================================
    // Empty State
    // ============================================================

    get noApplicationsFound() {

        return (
            !this.isLoading &&
            this.selectedStudentId &&
            this.filteredApplications.length === 0
        );
    }

    // ============================================================
    // Record Navigation
    // ============================================================

    handleRowAction(event) {

        const actionName =
            event.detail.action.name;

        const row =
            event.detail.row;

        if (
            actionName === 'view_record'
        ) {

            this[NavigationMixin.Navigate]({

                type: 'standard__recordPage',

                attributes: {

                    recordId: row.Id,

                    objectApiName:
                        'Job_Application__c',

                    actionName: 'view'
                }
            });
        }
    }
}