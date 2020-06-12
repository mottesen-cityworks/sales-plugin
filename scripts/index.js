define(["require", "exports", '../typescript/bundles/core', '../typescript/api/services/General/AuthenticationService', '../typescript/api/services/Ams/WorkOrderService', '../typescript/api/services/Ams/InspectionService', '../typescript/api/services/Ams/ServiceRequestService'], function (require, exports, Core, AuthenticationService_1, WorkOrderService_1, InspectionService_1, ServiceRequestService_1) {
    "use strict";
    var SalesWorkHistory = (function () {
        function SalesWorkHistory() {
            //Create a new api service for Testing
            /*
            let apiService: IApiService = new ApiService("https://cloud01.cityworks.com/_SME_KSMMS_CURRENT_mottesen");
            apiService.login("pwadmin1", "pwadmin1").then((authResponse) => {
                console.log(authResponse.Value);
            });
            */
            var _this = this;
            var apiService = new AuthenticationService_1.ApiService(window.myGlobalServerUrl);
            apiService.initializeCsrfToken();
            this.authService = new AuthenticationService_1.AuthenticationService(apiService);
            this.woService = new WorkOrderService_1.WorkOrderService(apiService);
            this.inspService = new InspectionService_1.InspectionService(apiService);
            this.srService = new ServiceRequestService_1.ServiceRequestService(apiService);
            var createBtn = document.getElementById('create-button');
            var createList = document.getElementById('new-work-activities');
            var clearBtn = document.getElementById('clear-button');
            clearBtn.addEventListener('click', function (e) { return _this.clear(); });
            var clearList = document.getElementById('cleared-work-activities');
            this.clearListElement = clearList;
            var emptyClearList = document.getElementById('empty-clear-list');
            emptyClearList.addEventListener('click', function (e) {
                $(clearList).empty();
            });
            var appSwitcherBtn = document.getElementById('app-switcher-button');
            appSwitcherBtn.addEventListener('click', function (e) { return _this.appSwitcher(e); });
        }
        SalesWorkHistory.prototype.clear = function () {
            var _this = this;
            //Process Work Orders
            this.woService.Statuses({}).then(function (response) {
                var statusArray = response.Value;
                var stringArray = [];
                statusArray.forEach(function (codeDesc, index) {
                    if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                        stringArray.push(codeDesc.Code);
                    }
                });
                _this.woService.Search({ Status: stringArray }).then(function (response) {
                    var workorderIds = response.Value;
                    workorderIds.forEach(function (woid) {
                        _this.woService.Update({ WorkOrderId: woid, CycleType: '0' }).then(function (response) {
                            if (response.Value.CycleType === Core.Enums.RepeatType.NEVER) {
                                // Try to close
                                _this.woService.Close({ WorkOrderIds: [woid] }).then(function (response) {
                                    if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                                        // Cancel instead
                                        _this.woService.Cancel({ WorkOrderIds: [woid], CancelReason: "Cleaning house", DateCancelled: new Date() }).then(function (response) {
                                            if (response.Status !== 0) {
                                                //Delete WO
                                                _this.woService.ById({ WorkOrderId: woid }).then(function (response) {
                                                    var woBase = response.Value;
                                                    _this.woService.Delete({ WorkOrderSids: [woBase.WorkOrderSid] }).then(function (response) {
                                                        if (response.Status === 0 && response.Value) {
                                                            //Notify user of Deleted WO
                                                            var listMessage = document.createElement('li');
                                                            listMessage.className = 'list-group-item';
                                                            listMessage.appendChild(document.createTextNode("Work Order " + response.Value[0] + " Deleted"));
                                                            _this.clearListElement.appendChild(listMessage);
                                                        }
                                                    });
                                                });
                                            }
                                            else {
                                                //Notify user of Cancelled WO
                                                var listMessage = document.createElement('li');
                                                listMessage.className = 'list-group-item';
                                                listMessage.appendChild(document.createTextNode("Work Order " + woid + " Cancelled"));
                                                _this.clearListElement.appendChild(listMessage);
                                            }
                                        });
                                    }
                                    else {
                                        //notify user of Closed work order
                                        var listMessage = document.createElement('li');
                                        listMessage.className = 'list-group-item';
                                        listMessage.appendChild(document.createTextNode("Work Order " + woid + " Closed"));
                                        _this.clearListElement.appendChild(listMessage);
                                    }
                                });
                            }
                        });
                    });
                });
            });
            //Process Inspections
            this.inspService.Statuses({}).then(function (response) {
                var inspStatuses = response.Value;
                var inspStatusArray = [];
                inspStatuses.forEach(function (codeDesc) {
                    if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                        inspStatusArray.push(codeDesc.Code);
                    }
                });
                _this.inspService.Search({ Status: inspStatusArray }).then(function (response) {
                    response.Value.forEach(function (inspId) {
                        // Set recurring to never
                        _this.inspService.Update({ InspectionId: inspId, CycleType: '0' }).then(function (response) {
                            if (response.Value.CycleType === Core.Enums.RepeatType.NEVER) {
                                // Try to Close
                                _this.inspService.Close({ InspectionIds: [inspId] }).then(function (response) {
                                    if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                                        // Cancel instead
                                        _this.inspService.Cancel({ InspectionIds: [inspId], CancelReason: "Cleaning house", DateCancelled: new Date() }).then(function (response) {
                                            if (response.Status !== 0) {
                                                //Delete
                                                _this.inspService.Delete({ InspectionIds: [inspId] }).then(function (response) {
                                                    if (response.Status === 0) {
                                                        //Notify user of Deleted Inspection
                                                        var listMessage = document.createElement('li');
                                                        listMessage.className = 'list-group-item';
                                                        listMessage.appendChild(document.createTextNode("Inspection " + inspId + " Deleted"));
                                                        _this.clearListElement.appendChild(listMessage);
                                                    }
                                                });
                                            }
                                            else {
                                                //Notify user of Cancelled Inspection
                                                var listMessage = document.createElement('li');
                                                listMessage.className = 'list-group-item';
                                                listMessage.appendChild(document.createTextNode("Inspection " + inspId + " Cancelled"));
                                                _this.clearListElement.appendChild(listMessage);
                                            }
                                        });
                                    }
                                    else {
                                        //Notify user of Closed Inspection
                                        var listMessage = document.createElement('li');
                                        listMessage.className = 'list-group-item';
                                        listMessage.appendChild(document.createTextNode("Inspection " + inspId + " Closed"));
                                        _this.clearListElement.appendChild(listMessage);
                                    }
                                });
                            }
                        });
                    });
                });
            });
            //Process Service Requests
            this.srService.Statuses({}).then(function (response) {
                var srStatuses = response.Value;
                var srStatusArray = [];
                srStatuses.forEach(function (codeDesc) {
                    if (codeDesc.Code !== 'CLOSED' && codeDesc.Code !== 'CANCEL') {
                        srStatusArray.push(codeDesc.Code);
                    }
                });
                _this.srService.Search({ Status: srStatusArray }).then(function (response) {
                    response.Value.forEach(function (reqId) {
                        // Try to Close
                        _this.srService.Close({ RequestIds: [reqId] }).then(function (response) {
                            if (response.Status !== 0 || response.ErrorMessages.length > 0) {
                                // Cancel instead
                                _this.srService.Cancel({ RequestIds: [reqId], CancelReason: "Cleaning house", DateCancelled: new Date() }).then(function (response) {
                                    if (response.Status !== 0) {
                                        //Delete
                                        _this.srService.Delete({ RequestIds: [reqId] }).then(function (response) {
                                            if (response.Status === 0) {
                                                //Notify user of Deleted Service Request
                                                var listMessage = document.createElement('li');
                                                listMessage.className = 'list-group-item';
                                                listMessage.appendChild(document.createTextNode("Service Request " + reqId + " Deleted"));
                                                _this.clearListElement.appendChild(listMessage);
                                            }
                                        });
                                    }
                                    else {
                                        //Notify user of Cancelled Service Request
                                        var listMessage = document.createElement('li');
                                        listMessage.className = 'list-group-item';
                                        listMessage.appendChild(document.createTextNode("Service Request " + reqId + " Cancelled"));
                                        _this.clearListElement.appendChild(listMessage);
                                    }
                                });
                            }
                            else {
                                //Notify user of Closed Service Request
                                var listMessage = document.createElement('li');
                                listMessage.className = 'list-group-item';
                                listMessage.appendChild(document.createTextNode("Service Request " + reqId + " Closed"));
                                _this.clearListElement.appendChild(listMessage);
                            }
                        });
                    });
                });
            });
        };
        SalesWorkHistory.prototype.appSwitcher = function (e) {
            var appSwitcherUrl = window.myGlobalServerUrl + '/AppSwitcher.aspx';
            window.location = appSwitcherUrl;
        };
        return SalesWorkHistory;
    }());
    new SalesWorkHistory();
});
//# sourceMappingURL=index.js.map