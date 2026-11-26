export interface paths {
    "/api/audit/corpus-state/public": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getCorpusCommitment"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/benchmarks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listBenchmarks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/benchmarks/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["verifyBenchmarks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/benchmarks/{benchmark_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getBenchmark"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{agent_id}/knowledge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listAgentKnowledge"];
        put?: never;
        post: operations["uploadAgentKnowledge"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{agent_id}/knowledge/url": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["ingestAgentKnowledgeUrl"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{agent_id}/knowledge/{collection_name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["deleteAgentKnowledge"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/message:send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["sendMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/agents/{agent_id}/agent-card.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAgentCard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/agents/{agent_id}/message:send": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["sendAgentMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/agents/{agent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["agentJsonRpc"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/message:stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["streamMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/tasks/{task_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getTask"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listTasks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/a2a/v1/tasks/{task_id}:cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["cancelTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/chat/completions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createChatCompletion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listModels"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/models/{model_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getModel"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/receipts/{receipt_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getReceipt"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/corpus-state": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getV1CorpusState"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["verifyClaim"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/clinical/med-check": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["checkMedications"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["searchEvidence"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/rerank": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["rerankDocuments"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["listAgents"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{agent_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAgent"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/agents/{agent_id}/skill": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getAgentSkill"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/feng/falsify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["falsifyClaim"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createApiKey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getUsage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/preferences": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getPreferences"];
        put: operations["updatePreferences"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/upgrade": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["createUpgradeCheckout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/topup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["topupCredits"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getBillingPortal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/rotate-key": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["rotateApiKey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/baa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getBaa"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/baa/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["acceptBaa"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/a2a/baa/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getBaaStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getLiveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/.well-known/agent-card.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["getFleetAgentCard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        URLIngestionRequest: {
            url: string;
            collection_name?: string | null;
            visibility: string;
        };
        SendMessageResponse: {
            task: components["schemas"]["A2ATask"];
        };
        A2ATask: {
            id: string;
            status: components["schemas"]["A2ATaskStatus"];
            artifacts: components["schemas"]["A2AArtifact"][];
            metadata: {
                [key: string]: unknown;
            };
            created_at: string;
            updated_at: string;
        };
        A2AArtifact: {
            name?: string | null;
            parts: components["schemas"]["A2APart"][];
            index: number;
        };
        A2APart: {
            text?: string | null;
            data?: {
                [key: string]: unknown;
            } | null;
            media_type?: string | null;
        };
        A2ATaskStatus: {
            state: string;
            message?: components["schemas"]["A2AMessage"] | null;
            timestamp: string;
        };
        A2AMessage: {
            role: string;
            parts: components["schemas"]["A2APart"][];
        };
        UpgradeRequest: {
            tier: string;
        };
        SignupResponse: {
            api_key: string;
            key_prefix: string;
            email: string;
            tier: string;
            monthly_limit: number;
            daily_limit: number;
            spending_cap_usd: number;
            product: string;
            scopes?: string[];
            warning: string;
        };
        api__routes__a2a_billing__SignupRequest: {
            email: string;
            name: string;
            tier: string;
            product: string;
            hcaptcha_token?: string | null;
        };
        TaskListResponse: {
            tasks: components["schemas"]["A2ATask"][];
            total: number;
            offset: number;
            limit: number;
        };
        api__routes__a2a__SendMessageRequest: {
            message: components["schemas"]["A2AMessage"];
            metadata: {
                session_id?: string;
                audience?: "patient" | "consumer" | "caregiver" | "principal" | "clinician" | "physician" | "nurse" | "pharmacist" | "hcp" | "professional" | "healthcare_professional";
                depth?: "base" | "auto";
                persona?: {
                    name?: string;
                    organization?: string;
                    tone?: "warm" | "clinical" | "concise" | "friendly" | "formal";
                };
                memory?: "on" | "off";
                verbosity?: "brief" | "standard" | "detailed";
                emoji?: "off" | "none" | "on";
                agent_id?: string;
            } & {
                [key: string]: unknown;
            };
            agent_id?: string | null;
        };
        ErrorResponse: {
            error: components["schemas"]["ErrorObject"];
            detail?: unknown;
        };
        ErrorObject: {
            code: number;
            type: string;
            message: string;
            retry_after?: number | null;
            doc_url: string;
            param?: string | null;
            request_id?: string | null;
            fields?: {
                [key: string]: unknown;
            }[] | null;
            error_id?: string | null;
        };
        PreferencesRequest: {
            persona?: components["schemas"]["PersonaPreference"] | null;
            audience?: string | null;
            verbosity?: string | null;
            emoji?: string | null;
            memory?: string | null;
            intended_user?: string | null;
            intended_user_attestation?: string | null;
        };
        PersonaPreference: {
            name: string;
            organization?: string | null;
            tone?: string | null;
        };
        api__routes__feng__FalsifyRequest: {
            claim: string;
            collections?: string[] | null;
            k: number;
        };
        Body_upload_knowledge_api_agents__agent_id__knowledge_post: {
            files: string[];
            collection_name?: string | null;
            visibility: string;
        };
        TopupRequest: {
            amount_usd: number;
        };
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        ValidationError: {
            loc: (string | number)[];
            msg: string;
            type: string;
            input?: unknown;
            ctx?: Record<string, never>;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: {
        XRequestId: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getCorpusCommitment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    listBenchmarks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    verifyBenchmarks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    getBenchmark: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                benchmark_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listAgentKnowledge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    uploadAgentKnowledge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_knowledge_api_agents__agent_id__knowledge_post"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    ingestAgentKnowledgeUrl: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["URLIngestionRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteAgentKnowledge: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
                collection_name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    sendMessage: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__a2a__SendMessageRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "Idempotent-Replayed"?: "true";
                    "Idempotency-Status"?: "unavailable";
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendMessageResponse"];
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getAgentCard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    sendAgentMessage: {
        parameters: {
            query?: never;
            header?: {
                "Idempotency-Key"?: string;
            };
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__a2a__SendMessageRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "Idempotent-Replayed"?: "true";
                    "Idempotency-Status"?: "unavailable";
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendMessageResponse"];
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    agentJsonRpc: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    streamMessage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__a2a__SendMessageRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                task_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendMessageResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    listTasks: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
                agent_id?: string | null;
                state?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskListResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    cancelTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                task_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SendMessageResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            500: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    createChatCompletion: {
        parameters: {
            query?: never;
            header?: {
                "X-DNAI-User"?: string;
                "X-DNAI-Sources"?: "keep";
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    model?: string;
                    instructions?: string;
                    response_format?: Record<string, never>;
                    messages: {
                        role: "system" | "developer" | "user" | "assistant";
                        content: string | {
                            type?: string;
                            text?: string;
                        }[];
                    }[];
                    stream?: boolean;
                    stream_options?: {
                        include_usage?: boolean;
                    };
                    metadata?: {
                        session_id?: string;
                        audience?: "patient" | "caregiver" | "consumer" | "clinician" | "nurse" | "pharmacist" | "physician" | "hcp";
                        memory?: "on" | "off";
                        verbosity?: "brief" | "standard" | "detailed";
                        emoji?: "off" | "none" | "on";
                        persona?: Record<string, never>;
                    };
                    temperature?: number;
                    max_tokens?: number;
                    user?: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        object?: "chat.completion";
                        created?: number;
                        model?: string;
                        choices?: {
                            index?: number;
                            message?: {
                                role?: string;
                                content?: string;
                            };
                            finish_reason?: "stop";
                        }[];
                        usage?: {
                            prompt_tokens?: number;
                            completion_tokens?: number;
                            total_tokens?: number;
                            dnai_token_counts_estimated?: boolean;
                        };
                        dnai_meta?: {
                            depth_requested?: "base" | "auto";
                            depth_served?: "base" | "mid" | "apex";
                            evidence_count?: number;
                            citations?: unknown[];
                            task_gravity?: number | null;
                        };
                        asha?: Record<string, never>;
                    };
                    "text/event-stream": string;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            451: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listModels: {
        parameters: {
            query?: {
                include?: "all";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        object?: "list";
                        data?: {
                            id?: string;
                            object?: "model";
                            created?: number;
                            owned_by?: string;
                            display_name?: string;
                            status?: "ga" | "preview" | "planned" | "blocked" | "legacy";
                            context_window?: number;
                            capabilities?: Record<string, never>;
                            latency_band?: Record<string, never>;
                            pricing?: Record<string, never>;
                            free_allowance?: Record<string, never>;
                            plans?: string[];
                            intended_user?: string[];
                            snapshots?: string[];
                            aliases?: string[];
                        }[];
                    };
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getModel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                model_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getReceipt: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                receipt_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getV1CorpusState: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createMessage: {
        parameters: {
            query?: never;
            header?: {
                "x-api-key"?: string;
                "anthropic-version"?: string;
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    model: string;
                    max_tokens?: number;
                    system?: string | {
                        type?: "text";
                        text?: string;
                    }[];
                    messages: {
                        role: "user" | "assistant";
                        content: string | {
                            type?: "text";
                            text?: string;
                        }[];
                    }[];
                    stream?: boolean;
                    metadata?: Record<string, never>;
                    stop_sequences?: string[];
                    temperature?: number;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        id?: string;
                        type?: "message";
                        role?: "assistant";
                        model?: string;
                        content?: {
                            type?: "text";
                            text?: string;
                            citations?: {
                                type?: "web_search_result_location";
                                cited_text?: string;
                                url?: string | null;
                                title?: string | null;
                                encrypted_index?: string;
                            }[];
                        }[];
                        stop_reason?: "end_turn";
                        stop_sequence?: null;
                        usage?: {
                            input_tokens?: number;
                            output_tokens?: number;
                        };
                        asha?: Record<string, never>;
                    };
                    "text/event-stream": string;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            410: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            451: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verifyClaim: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    claim: string;
                    context?: string;
                    domain?: "drug_safety" | "guidelines" | "literature" | "medical";
                    top_k?: number;
                    model?: "asha-verify";
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    checkMedications: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    medications: (string | {
                        name: string;
                        dose?: string;
                        route?: string;
                        frequency?: string;
                        sig?: string;
                        indication?: string;
                        id?: string;
                    })[];
                    pregnancy?: boolean;
                    lactation?: boolean;
                    age?: number;
                    sex?: "female" | "male" | "f" | "m";
                    weight_kg?: number;
                    egfr?: number;
                    creatinine?: number;
                    potassium?: number;
                    allergies?: (string | {
                        allergen?: string;
                        reaction?: string;
                    })[];
                    audience?: "clinician" | "hcp" | "consumer" | "patient";
                    format?: "json" | "fhir";
                    model?: "asha-med-check";
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    searchEvidence: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    query: string;
                    top_k?: number;
                    filters?: {
                        domain?: "clinical" | "codes" | "drugs" | "general" | "guidelines";
                        year_from?: number;
                        year_to?: number;
                        source_type?: ("literature" | "guideline" | "drug_label" | "code" | "dataset")[];
                    };
                    model?: "asha-search";
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    rerankDocuments: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    query: string;
                    documents: (string | {
                        text: string;
                    })[];
                    top_n?: number;
                    return_documents?: boolean;
                    model?: "asha-rerank";
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listAgents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    getAgent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getAgentSkill: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agent_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    falsifyClaim: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__feng__FalsifyRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            403: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            500: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    createApiKey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["api__routes__a2a_billing__SignupRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SignupResponse"];
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            409: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            429: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getUsage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getPreferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    updatePreferences: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PreferencesRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    createUpgradeCheckout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpgradeRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            500: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    topupCredits: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TopupRequest"];
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            500: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getBillingPortal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            500: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    rotateApiKey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getBaa: {
        parameters: {
            query?: {
                format?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    acceptBaa: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    organization: string;
                    signer_name: string;
                    signer_title: string;
                    signer_email: string;
                    attest_authority: true;
                    accept_version: string;
                    accept_sha256?: string;
                    source?: string;
                };
            };
        };
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        acceptance_id?: string;
                        accepted_at?: string;
                        baa_version?: string;
                        baa_sha256?: string;
                        document_status?: string;
                        organization?: string;
                        signer?: {
                            name?: string;
                            title?: string;
                            email?: string;
                        };
                        phi_allowed?: boolean;
                        phi_readiness?: {
                            document_effective?: boolean;
                            document_version?: string;
                            llm_path_covered?: boolean;
                            llm_provider?: string;
                            phi_mode_open?: boolean;
                            blockers?: string[];
                        };
                        document_url?: string;
                        note?: string;
                    };
                };
            };
            400: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
            503: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getBaaStatus: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    getLiveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    getFleetAgentCard: {
        parameters: {
            query?: {
                agent_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            422: {
                headers: {
                    "X-Request-ID": components["headers"]["XRequestId"];
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
