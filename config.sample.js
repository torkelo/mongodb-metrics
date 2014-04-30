
module.exports = {
    graphiteHost: 'you.graphite.server',
    graphitePort: 2003,

    intervalSeconds: 10,

    graphiteKeyTemplateGauges: 'test.databases.<%= cluster %>.<%= host %>.<%= metric %>.mean',
    graphiteKeyTemplateCounters: 'test.databases.<%= cluster %>.<%= host %>.<%= metric %>.count',

    servers: [
        {
            host: 'mongo-server-01',
            shortName: 'mongo_01', // optional
            cluster: 'main', // optional
            setMemberName: "mongo-server-01:27017" // for replicate set member lookup
        },
        {
            host: 'mongo-server-02',
            shortName: 'mongo_02', // optional
            cluster: 'main', // optional
            setMemberName: "mongo-server-02:27017" // for replicate set member lookup
        },
        {
            host: 'mongo-server-03',
            shortName: 'mongo_03', // optional
            cluster: 'main', // optional
            setMemberName: "mongo-server-03:27017" // for replicate set member lookup
        },
    ],

    metrics: {
        replSetGetStatus: 1,

        serverStatus: {
            connections: {
                current: "gauge",
                available: "gauge",
                totalCreated: "counter"
            },

            backgroundFlushing: {
                last_ms: "gauge",
                average_ms: "gauge",
                total_ms: "gauge",
                flushes: "counter"
            },

            asserts: {
                regular: "counter",
                warning: "counter",
                msg: "counter",
                user: "counter",
                rollovers: "counter"
            },

            cursors: {
                totalOpen: "gauge",
                timedOut: "counter"
            },

            opcounters: {
                update: "counter",
                query: "counter",
                insert: "counter",
                getmore: "counter",
                getmore: "command"
            },

            opcountersRepl: {
                insert: "counter",
                query: "counter",
                update: "counter",
                "delete": "counter",
                getmore: "counter",
                command: "counter"
            },

            dur: {
                commits: "counter",
                journaledMB: "gauge",
                writeToDataFilesMB: "gauge",
                commitsInWriteLock: "counter",
                earlyCommits: "counter",
                timeMS: {
                    dt: 'gauge',
                    prepLogBuffer: 'gauge',
                    writeToJournal: 'gauge',
                    writeToDataFiles: 'gauge',
                    remapPrivateView: 'gauge'
                }
            },

            extra_info: {
                heap_usage_bytes: 'gauge',
                page_faults: "counter"
            },

            indexCounters: {
                accesses: "counter",
                hits: "counter",
                misses: "counter",
                resets: "counter",
                missRatio: "gauge"
            },

            network: {
                bytesIn: "counter",
                bytesOut: "counter",
                numRequests: "counter"
            },

            repl: {
                ismaster: "gauge",
            },

            recordStats: {
                accessesNotInMemory: "counter",
                pageFaultExceptionsThrown: "counter"
            },

            metrics: {
                document: {
                    deleted: "counter",
                    inserted: "counter",
                    updated: "counter"
                },

                getLastError: {
                    wtime: {
                        num: "counter",
                        totalMillis: "counter",
                        wtimeouts: "counter"
                    },
                },
                operation: {
                    fastmod: "counter",
                    idhack: "counter",
                    scanAndOrder: "counter"
                },
                queryExecutor: { scanned: "counter" },
                record: { moves: "counter" },

                repl: {
                    apply: {
                        batches: {
                            num: "counter",
                            totalMillis: "counter"
                        },
                        ops: "counter"
                    },
                    buffer: {
                        count: "counter",
                        sizeBytes: "gauge"
                    },
                    network: {
                        bytes: "counter",
                        getmores: { num: "counter", totalMillis: "counter" },
                        ops: "counter"
                    },
                    oplog: {
                        insert: { num: "counter", totalMillis: "counter" },
                        insertBytes: "counter"
                    },
                    preload: {
                        docs: { num: "counter", totalMillis: "counter" },
                        indexes: { num: "counter", totalMillis: "counter" }
                    }
                },

                ttl: {
                    deletedDocuments: "counter",
                    passes: "counter"
                }
            },

            globalLock: {
                lockTime: "counter",
                currentQueue: {
                    total: "gauge",
                    readers: "gauge",
                    writers: "gauge"
                },
                activeClients: {
                    total: "gauge",
                    readers: "gauge",
                    writers: "gauge"
                }
            },

            mem: {
                resident: "gauge",
                virtual: "gauge",
                mapped: "gauge",
                mappedWithJournal: "gauge"
            }

        },

    }
}