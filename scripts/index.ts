import * as Core from '../typescript/bundles/core';
import * as ServiceInterface from '../typescript/bundles/service-interfaces';
import { AuthenticationService, ApiService, IApiService } from '../typescript/api/services/General/AuthenticationService';
import { WorkOrderService } from '../typescript/api/services/Ams/WorkOrderService';
import { InspectionService } from '../typescript/api/services/Ams/InspectionService';
import { ServiceRequestService } from '../typescript/api/services/Ams/ServiceRequestService';

import AbortablePromise = Core.PromiseTypes.AbortablePromise;

class SalesWorkHistory {
    authService: AuthenticationService;
    woService: WorkOrderService;
    inspService: InspectionService;
    srService: ServiceRequestService;
    clearListElement: HTMLElement;
    constructor() {
        //Create a new api service for Testing
        
        let apiService: IApiService = new ApiService("https://cloud01.cityworks.com/_SME_KSMMS_CURRENT_mottesen");
        apiService.login("pwadmin1", "pwadmin1").then((authResponse) => {
            console.log(authResponse.Value);
        })        

        /*
        let apiService: IApiService = new ApiService(window.myGlobalServerUrl);
        apiService.initializeCsrfToken();
        */
        this.authService = new AuthenticationService(apiService);
        this.woService = new WorkOrderService(apiService);
        this.inspService = new InspectionService(apiService);
        this.srService = new ServiceRequestService(apiService);


        let clearBtn = document.getElementById('clear-button');
        clearBtn.addEventListener('click', (e: Event) => this.clear());

        let clearList = document.getElementById('cleared-work-activities');
        this.clearListElement = clearList;

        let appSwitcherBtn = document.getElementById('app-switcher-button');
        appSwitcherBtn.addEventListener('click', (e: Event) => this.appSwitcher(e));
    }

    clear() {
        //Process Work Orders
        this.woService.Statuses({}).then((response) => {
            let statusArray = response.Value;
            let stringArray = []
            statusArray.forEach((codeDesc, index) => {
                if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                    stringArray.push(codeDesc.Code);
                }
            })
            this.woService.Search({ Status: stringArray }).then((response) => {
                let workorderIds = response.Value;
                workorderIds.forEach((woid) => {
                    // Try to close
                    this.woService.Close({ WorkOrderIds: [woid] }).then((response) => {
                        if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                            // Cancel instead
                            this.woService.Cancel({ WorkOrderIds: [woid], CancelReason: "Cleaning house", DateCancelled: new Date() }).then((response) => {
                                if (response.Status !== 0) {
                                    //Delete WO
                                    this.woService.ById({ WorkOrderId: woid }).then((response) => {
                                        let woBase = response.Value;
                                        this.woService.Delete({ WorkOrderSids: [woBase.WorkOrderSid] }).then((response) => {
                                            if (response.Status === 0 && response.Value) {
                                                //Notify user of Deleted WO
                                                let listMessage = document.createElement('li');
                                                listMessage.className = 'list-group-item';
                                                listMessage.appendChild(document.createTextNode(`Work Order ${response.Value[0]} Deleted`));
                                                this.clearListElement.appendChild(listMessage);
                                            }
                                        })
                                    })
                                }

                                else {
                                    //Notify user of Cancelled WO
                                    let listMessage = document.createElement('li');
                                    listMessage.className = 'list-group-item';
                                    listMessage.appendChild(document.createTextNode(`Work Order ${woid} Cancelled`));
                                    this.clearListElement.appendChild(listMessage);
                                }
                            })
                        }

                        else {
                            //notify user of Closed work order
                            let listMessage = document.createElement('li');
                            listMessage.className = 'list-group-item';
                            listMessage.appendChild(document.createTextNode(`Work Order ${woid} Closed`));
                            this.clearListElement.appendChild(listMessage);
                        }

                    })
                })

            })
        });

        //Process Inspections
        this.inspService.Statuses({}).then((response) => {
            let inspStatuses = response.Value;
            let inspStatusArray = []
            inspStatuses.forEach((codeDesc) => {
                if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                    inspStatusArray.push(codeDesc.Code)
                }
            })
            this.inspService.Search({ Status: inspStatusArray }).then((response) => {
                response.Value.forEach((inspId) => {
                    // Try to Close
                    this.inspService.Close({ InspectionIds: [inspId] }).then((response) => {
                        if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                            // Cancel instead
                            this.inspService.Cancel({ InspectionIds: [inspId], CancelReason: "Cleaning house", DateCancelled: new Date() }).then((response) => {
                                if (response.Status !== 0) {
                                    //Delete
                                    this.inspService.Delete({ InspectionIds: [inspId] }).then((response) => {
                                        if (response.Status === 0) {
                                            //Notify user of Deleted Inspection
                                            let listMessage = document.createElement('li');
                                            listMessage.className = 'list-group-item';
                                            listMessage.appendChild(document.createTextNode(`Inspection ${inspId} Deleted`));
                                            this.clearListElement.appendChild(listMessage);
                                        }
                                    })
                                }

                                else {
                                    //Notify user of Cancelled Inspection
                                    let listMessage = document.createElement('li');
                                    listMessage.className = 'list-group-item';
                                    listMessage.appendChild(document.createTextNode(`Inspection ${inspId} Cancelled`));
                                    this.clearListElement.appendChild(listMessage);
                                }
                            })
                        }

                        else {
                            //Notify user of Closed Inspection
                            let listMessage = document.createElement('li');
                            listMessage.className = 'list-group-item';
                            listMessage.appendChild(document.createTextNode(`Inspection ${inspId} Closed`));
                            this.clearListElement.appendChild(listMessage);
                        }
                    })
                })
            })
        })

        //Process Service Requests
        this.srService.Statuses({}).then((response) => {
            let srStatuses = response.Value;
            let srStatusArray = []
            srStatuses.forEach((codeDesc) => {
                if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                    srStatusArray.push(codeDesc.Code)
                }
            })
            this.srService.Search({ Status: srStatusArray }).then((response) => {
                response.Value.forEach((reqId) => {
                    // Try to Close
                    this.srService.Close({ RequestIds: [reqId] }).then((response) => {
                        if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                            // Cancel instead
                            this.srService.Cancel({ RequestIds: [reqId], CancelReason: "Cleaning house", DateCancelled: new Date() }).then((response) => {
                                if (response.Status !== 0) {
                                    //Delete
                                    this.srService.Delete({ RequestIds: [reqId] }).then((response) => {
                                        if (response.Status === 0) {
                                            //Notify user of Deleted Service Request
                                            let listMessage = document.createElement('li');
                                            listMessage.className = 'list-group-item';
                                            listMessage.appendChild(document.createTextNode(`Service Request ${reqId} Deleted`));
                                            this.clearListElement.appendChild(listMessage);
                                        }
                                    })
                                }

                                else {
                                    //Notify user of Cancelled Service Request
                                    let listMessage = document.createElement('li');
                                    listMessage.className = 'list-group-item';
                                    listMessage.appendChild(document.createTextNode(`Service Request ${reqId} Cancelled`));
                                    this.clearListElement.appendChild(listMessage);
                                }
                            })
                        }

                        else {
                            //Notify user of Closed Service Request
                            let listMessage = document.createElement('li');
                            listMessage.className = 'list-group-item';
                            listMessage.appendChild(document.createTextNode(`Service Request ${reqId} Closed`));
                            this.clearListElement.appendChild(listMessage);
                        }
                    })
                })
            })
        })
    }

    appSwitcher(e: Event) {
        let appSwitcherUrl = window.myGlobalServerUrl + '/AppSwitcher.aspx';
        window.location = <any>appSwitcherUrl;
    }
}

new SalesWorkHistory();