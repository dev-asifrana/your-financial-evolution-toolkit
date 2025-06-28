$(document).ready(function() {
    // Calculator titles and descriptions
    const calculatorInfo = {
        home: {
            title: "The Financial Evolution Toolkit",
            subtitle: "Unlock financial clarity in minutes — not months.<br>These calculators give you the answers most people pay advisors to figure out."
        },
        compound: {
            title: "Compound Interest Calculator", 
            subtitle: "Discover the power of compound interest and regular investments"
        },
        investment: {
            title: "Investment Fee Comparison",
            subtitle: "Compare the long-term impact of investment fees on your portfolio"
        },
        debt: {
            title: "Debt-Free Date Calculator",
            subtitle: "Plan your path to financial freedom and see the impact of extra payments"
        },
        biweekly: {
            title: "Biweekly Payment Calculator",
            subtitle: "Convert monthly or annual payments into biweekly amounts that align with your pay schedule"
        }
    };
    
    // Navigation function
    function showCalculator(calcType) {
        if (calcType === 'home') {
            $('#calculatorOverview').show();
            $('#calculatorSections').hide();
            $('#backToHome').hide();
        } else {
            $('#calculatorOverview').hide();
            $('#calculatorSections').show();
            $('#backToHome').show();
            
            // Hide all calculator sections
            $('.calculator-section').hide();
            // Show the selected calculator
            $('#' + calcType).show();
        }
        
        // Update header
        const info = calculatorInfo[calcType];
        if (info) {
            $('#dynamicTitle').html(info.title);
            $('#dynamicSubtitle').html(info.subtitle);
        }
        
        // Update navigation active state
        $('.nav-calc').removeClass('active');
        $(`.nav-calc[data-calc="${calcType}"]`).addClass('active');
        
        // Collapse mobile menu
        $('.navbar-collapse').collapse('hide');
        
        // Scroll to top
        $('html, body').animate({ scrollTop: 0 }, 500);
    }
    
    // Handle launch calculator buttons
    $(document).on('click', '.launch-calc', function(e) {
        e.preventDefault();
        const calcType = $(this).data('calc');
        showCalculator(calcType);
    });
    
    // Handle navigation buttons
    $(document).on('click', '.nav-calc', function(e) {
        e.preventDefault();
        const calcType = $(this).data('calc');
        showCalculator(calcType);
    });
    
    // Handle back to home button
    $(document).on('click', '#backToHome', function(e) {
        e.preventDefault();
        showCalculator('home');
    });
    
    // Handle navbar brand click
    $(document).on('click', '.navbar-brand', function(e) {
        e.preventDefault();
        showCalculator('home');
    });
    
    // Initialize with home view
    showCalculator('home');

    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function formatPercentage(rate) {
        return `${rate.toFixed(2)}%`;
    }

    // Compound Interest Calculator
    $('#compoundForm').on('submit', function(e) {
        e.preventDefault();
        
        const initialAmount = parseFloat($('#initialAmount').val()) || 0;
        const annualRate = parseFloat($('#annualRate').val()) / 100 || 0;
        const monthlyContribution = parseFloat($('#monthlyContribution').val()) || 0;
        const years = parseInt($('#years').val()) || 0;
        
        // Convert monthly contribution to annual (standard practice)
        const annualContribution = monthlyContribution * 12;
        
        // Calculate future value using standard compound interest formula
        // FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
        // Where contributions are made at end of each year
        
        // Future value of initial principal
        const futureValuePrincipal = initialAmount * Math.pow(1 + annualRate, years);
        
        // Future value of annual contributions (end of year)
        let futureValueContributions = 0;
        if (annualContribution > 0 && annualRate > 0) {
            // Standard future value of annuity formula
            futureValueContributions = annualContribution * (Math.pow(1 + annualRate, years) - 1) / annualRate;
        } else if (annualContribution > 0 && annualRate === 0) {
            // If no interest, just multiply contributions by years
            futureValueContributions = annualContribution * years;
        }
        
        const totalFutureValue = futureValuePrincipal + futureValueContributions;
        const totalContributions = initialAmount + (annualContribution * years);
        const totalInterest = totalFutureValue - totalContributions;
        const roi = totalContributions > 0 ? (totalInterest / totalContributions) * 100 : 0;
        
        // Display results
        $('#finalBalance').text(formatCurrency(totalFutureValue));
        $('#totalContributions').text(formatCurrency(totalContributions));
        $('#interestEarned').text(formatCurrency(totalInterest));
        $('#roi').text(formatPercentage(roi));
        
        // Create chart data
        createCompoundChart(initialAmount, monthlyContribution, annualRate, years);
        
        $('#compoundResults').fadeIn();
    });

    // Investment Fee Comparison Calculator
    $('#investmentForm').on('submit', function(e) {
        e.preventDefault();
        
        const startingAmount = parseFloat($('#startingAmount').val()) || 0;
        const expectedReturn = parseFloat($('#expectedReturn').val()) / 100 || 0;
        const monthlyContrib = parseFloat($('#monthlyContrib').val()) || 0;
        const duration = parseInt($('#duration').val()) || 0;
        const selfFee = parseFloat($('#selfFee').val()) / 100 || 0;
        const advisorFee = parseFloat($('#advisorFee').val()) / 100 || 0;
        
        // Calculate balance with year-by-year simulation
        function calculateBalance(startAmount, monthlyContrib, annualReturn, annualFee, years) {
            let balance = startAmount;
            
            for (let year = 1; year <= years; year++) {
                // Add monthly contributions for the year
                balance += monthlyContrib * 12;
                
                // Apply annual return
                balance *= (1 + annualReturn);
                
                // Deduct annual fee
                balance *= (1 - annualFee);
            }
            
            return balance;
        }
        
        const totalSelf = calculateBalance(startingAmount, monthlyContrib, expectedReturn, selfFee, duration);
        const totalAdvisor = calculateBalance(startingAmount, monthlyContrib, expectedReturn, advisorFee, duration);
        const totalInvested = startingAmount + (monthlyContrib * 12 * duration);
        const feeDifference = totalSelf - totalAdvisor;
        
        // Calculate total fees paid
        const totalNoFees = calculateBalance(startingAmount, monthlyContrib, expectedReturn, 0, duration);
        const feesSelfPaid = totalNoFees - totalSelf;
        const feesAdvisorPaid = totalNoFees - totalAdvisor;
        const extraFees = feesAdvisorPaid - feesSelfPaid;
        
        // Display results
        $('#selfManagedValue').text(formatCurrency(totalSelf));
        $('#advisorManagedValue').text(formatCurrency(totalAdvisor));
        $('#feeDifference').text(formatCurrency(feeDifference));
        $('#extraFees').text(formatCurrency(extraFees));
        
        // Create chart
        createInvestmentChart(startingAmount, monthlyContrib, expectedReturn, selfFee, advisorFee, duration);
        
        $('#investmentResults').fadeIn();
    });

    // Debt Free Calculator
    $('#debtForm').on('submit', function(e) {
        e.preventDefault();
        
        const debtAmount = parseFloat($('#debtAmount').val()) || 0;
        const debtRate = parseFloat($('#debtRate').val()) / 100 / 12 || 0; // Monthly rate
        const minPayment = parseFloat($('#minPayment').val()) || 0;
        const extraPayment = parseFloat($('#extraPayment').val()) || 0;
        
        // Calculate payoff time with minimum payment only
        function calculatePayoffTime(principal, monthlyRate, payment) {
            if (payment <= principal * monthlyRate) {
                return { months: Infinity, totalInterest: Infinity };
            }
            
            let balance = principal;
            let months = 0;
            let totalInterest = 0;
            
            while (balance > 0.01 && months < 600) { // Max 50 years
                const interestPayment = balance * monthlyRate;
                const principalPayment = Math.min(payment - interestPayment, balance);
                
                totalInterest += interestPayment;
                balance -= principalPayment;
                months++;
            }
            
            return { months: Math.ceil(months), totalInterest };
        }
        
        const minPayoffResult = calculatePayoffTime(debtAmount, debtRate, minPayment);
        const extraPayoffResult = calculatePayoffTime(debtAmount, debtRate, minPayment + extraPayment);
        
        const timeSaved = minPayoffResult.months - extraPayoffResult.months;
        const interestSaved = minPayoffResult.totalInterest - extraPayoffResult.totalInterest;
        
        // Display results
        $('#payoffTime').text(`${extraPayoffResult.months} months`);
        $('#totalInterest').text(formatCurrency(extraPayoffResult.totalInterest));
        $('#interestSaved').text(formatCurrency(interestSaved));
        $('#timeSaved').text(`${timeSaved} months`);
        
        // Create chart
        createDebtChart(debtAmount, debtRate, minPayment, extraPayment);
        
        $('#debtResults').fadeIn();
    });

    // Biweekly Payment Calculator
    $('#biweeklyForm').on('submit', function(e) {
        e.preventDefault();
        
        const monthlyAmount = parseFloat($('#monthlyAmount').val()) || 0;
        const annualAmount = parseFloat($('#annualAmount').val()) || 0;
        
        // Validate that only one field is filled
        if (monthlyAmount > 0 && annualAmount > 0) {
            alert('Please enter either a monthly OR annual amount, not both.');
            return;
        }
        
        if (monthlyAmount === 0 && annualAmount === 0) {
            alert('Please enter either a monthly or annual amount.');
            return;
        }
        
        let biweeklyAmount, annualTotal;
        
        if (monthlyAmount > 0) {
            // Convert monthly to biweekly (26 pay periods per year)
            annualTotal = monthlyAmount * 12;
            biweeklyAmount = annualTotal / 26;
        } else {
            // Convert annual to biweekly
            annualTotal = annualAmount;
            biweeklyAmount = annualAmount / 26;
        }
        
        // Display results
        $('#biweeklyAmount').text(formatCurrency(biweeklyAmount));
        $('#annualTotal').text(formatCurrency(annualTotal));
        
        $('#biweeklyResults').fadeIn();
    });

    // Chart creation functions
    function createCompoundChart(initial, monthly, rate, years) {
        const ctx = document.getElementById('compoundChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.compoundChartInstance) {
            window.compoundChartInstance.destroy();
        }
        
        const annualContribution = monthly * 12;
        const labels = [];
        const balanceData = [];
        const contributionData = [];
        
        // Generate data points for each year (not month) to match calculation logic
        for (let year = 0; year <= years; year++) {
            // Future value of initial investment
            const fvPrincipal = initial * Math.pow(1 + rate, year);
            
            // Future value of annual contributions (made at end of each year)
            let fvContributions = 0;
            if (year > 0 && annualContribution > 0 && rate > 0) {
                fvContributions = annualContribution * (Math.pow(1 + rate, year) - 1) / rate;
            } else if (year > 0 && annualContribution > 0 && rate === 0) {
                fvContributions = annualContribution * year;
            }
            
            const totalBalance = fvPrincipal + fvContributions;
            const totalContributed = initial + (annualContribution * year);
            
            labels.push(year);
            balanceData.push(totalBalance);
            contributionData.push(totalContributed);
        }
        
        window.compoundChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Balance',
                    data: balanceData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Total Contributions',
                    data: contributionData,
                    borderColor: '#FF6600',
                    backgroundColor: 'rgba(255, 102, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment Growth Over Time',
                        font: { size: window.innerWidth < 768 ? 14 : 16 }
                    },
                    legend: {
                        labels: {
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 6 : 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value ($)',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
                            callback: function(value) {
                                return window.innerWidth < 768 ? 
                                    '$' + (value / 1000).toFixed(0) + 'K' : 
                                    formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    function createInvestmentChart(starting, monthly, rate, selfFee, advisorFee, years) {
        const ctx = document.getElementById('investmentChart').getContext('2d');
        
        if (window.investmentChartInstance) {
            window.investmentChartInstance.destroy();
        }
        
        const labels = [];
        const selfValues = [];
        const advisorValues = [];
        
        function simulateBalance(startAmount, monthlyContrib, annualReturn, annualFee, targetYear) {
            let balance = startAmount;
            
            for (let year = 1; year <= targetYear; year++) {
                balance += monthlyContrib * 12;
                balance *= (1 + annualReturn);
                balance *= (1 - annualFee);
            }
            
            return balance;
        }
        
        for (let year = 0; year <= years; year++) {
            labels.push(year);
            
            if (year === 0) {
                selfValues.push(starting);
                advisorValues.push(starting);
            } else {
                selfValues.push(simulateBalance(starting, monthly, rate, selfFee, year));
                advisorValues.push(simulateBalance(starting, monthly, rate, advisorFee, year));
            }
        }
        
        window.investmentChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Self-Managed (${(selfFee * 100).toFixed(2)}% fee)`,
                    data: selfValues,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: `Advisor-Managed (${(advisorFee * 100).toFixed(2)}% fee)`,
                    data: advisorValues,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Investment Value Comparison Over Time',
                        font: { size: window.innerWidth < 768 ? 14 : 16 }
                    },
                    legend: {
                        labels: {
                            font: { size: window.innerWidth < 768 ? 11 : 14 }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 6 : 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Portfolio Value ($)',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
                            callback: function(value) {
                                return window.innerWidth < 768 ? 
                                    '$' + (value / 1000).toFixed(0) + 'K' : 
                                    formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    function createDebtChart(debt, monthlyRate, minPayment, extraPayment) {
        const ctx = document.getElementById('debtChart').getContext('2d');
        
        if (window.debtChartInstance) {
            window.debtChartInstance.destroy();
        }
        
        // Calculate balances for both scenarios
        function calculateBalanceOverTime(principal, rate, payment) {
            const balances = [principal];
            let balance = principal;
            let month = 0;
            
            while (balance > 0.01 && month < 600) {
                const interestPayment = balance * rate;
                const principalPayment = Math.min(payment - interestPayment, balance);
                balance -= principalPayment;
                month++;
                balances.push(Math.max(0, balance));
            }
            
            return balances;
        }
        
        const minBalances = calculateBalanceOverTime(debt, monthlyRate, minPayment);
        const extraBalances = calculateBalanceOverTime(debt, monthlyRate, minPayment + extraPayment);
        
        const maxLength = Math.max(minBalances.length, extraBalances.length);
        const labels = Array.from({length: maxLength}, (_, i) => i);
        
        // Pad shorter array with zeros
        while (minBalances.length < maxLength) minBalances.push(0);
        while (extraBalances.length < maxLength) extraBalances.push(0);
        
        window.debtChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Minimum Payment Only',
                    data: minBalances,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }, {
                    label: 'With Extra Payment',
                    data: extraBalances,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Debt Balance Over Time',
                        font: { size: window.innerWidth < 768 ? 14 : 16 }
                    },
                    legend: {
                        labels: {
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Months',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 6 : 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Remaining Balance ($)',
                            font: { size: window.innerWidth < 768 ? 12 : 14 }
                        },
                        ticks: {
                            font: { size: window.innerWidth < 768 ? 10 : 12 },
                            maxTicksLimit: window.innerWidth < 768 ? 5 : 8,
                            callback: function(value) {
                                return window.innerWidth < 768 ? 
                                    '$' + (value / 1000).toFixed(0) + 'K' : 
                                    formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Clear form fields when switching between monthly and annual in biweekly calculator
    $('#monthlyAmount').on('input', function() {
        if ($(this).val()) {
            $('#annualAmount').val('');
        }
    });

    $('#annualAmount').on('input', function() {
        if ($(this).val()) {
            $('#monthlyAmount').val('');
        }
    });

    // Add animation to cards when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe all premium cards and result sections
    $('.premium-card, .result-card, .chart-container').each(function() {
        observer.observe(this);
    });
}); 