# Professional 15-Slide Example

A complete example of a professional presentation about microservices migration.

## Structure Overview

```
Slide 1:  cover      - Title + subtitle + author
Slide 2:  default    - Agenda/outline (with v-clicks)
Slide 3:  center     - Problem statement or hook
Slide 4:  default    - Context/background (with v-clicks)
Slide 5:  image-right - Key concept with visual
Slide 6:  default    - Main point 1 (with v-clicks)
Slide 7:  two-cols   - Comparison or details
Slide 8:  default    - Main point 2 (with v-clicks)
Slide 9:  default    - Code example (with line highlighting)
Slide 10: default    - Main point 3 (with v-clicks)
Slide 11: default    - Mermaid diagram for architecture/flow
Slide 12: fact       - Key metric or result
Slide 13: two-cols   - Before vs After summary
Slide 14: quote      - Testimonial or key takeaway
Slide 15: end        - Thank you + contact/links
```

## Full Example

```markdown
---
theme: seriph
title: Microservices Migration
background: https://cover.sli.dev
class: text-center
highlighter: shiki
transition: slide-left
mdc: true
---

# Microservices Migration
## From Monolith to Scale

<div class="abs-br m-6 text-sm opacity-50">
  Jane Smith · Tech Lead · 2024
</div>

<!--
Welcome everyone. Today I'll share our journey migrating to microservices.
-->

---

# Agenda

<v-clicks>

- The problem with our monolith
- Migration strategy
- Technical implementation
- Results and lessons learned
- Q&A

</v-clicks>

<!--
We'll cover these 5 main topics in about 15 minutes.
-->

---
layout: center
class: text-center
---

# "Our deployments took 4 hours and failed 30% of the time"

<div class="text-sm opacity-50 mt-4">
  — Engineering Team, January 2023
</div>

<!--
This was the reality we faced. Let me explain how we got here.
-->

---

# The Monolith Problem

<v-clicks>

- **500K lines** of tightly coupled code
- **45-minute** build times
- **4-hour** deployment windows
- **30%** deployment failure rate
- **3 teams** blocked by each other

</v-clicks>

<!--
[click] Half a million lines in one repo
[click] Builds alone took 45 minutes
[click] We could only deploy on weekends
[click] Almost a third of deployments failed
[click] Teams couldn't work independently
-->

---
layout: image-right
image: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800
---

# Our Architecture (Before)

Single Node.js application:

- All features in one codebase
- Shared database
- No service boundaries
- Horizontal scaling only

<div class="text-sm opacity-50 mt-4">
  Everything deployed together, failed together
</div>

<!--
This is what we were dealing with. A classic monolith.
-->

---

# Migration Strategy

<v-clicks>

- **Strangler Fig Pattern** - Gradually replace, don't rewrite
- **Domain-Driven Design** - Identify bounded contexts
- **API Gateway** - Route traffic during transition
- **Event Sourcing** - Decouple with async messaging

</v-clicks>

<!--
We chose proven patterns rather than a big-bang rewrite.
-->

---
layout: two-cols
layoutClass: gap-8
---

# Bounded Contexts

We identified 6 domains:

<v-clicks>

- User Management
- Order Processing
- Inventory
- Payments
- Notifications
- Analytics

</v-clicks>

::right::

# Team Mapping

<v-clicks>

- Platform Team → User, Gateway
- Commerce Team → Order, Inventory
- Finance Team → Payments
- Growth Team → Notifications, Analytics

</v-clicks>

<!--
Each domain became a service, each team owned specific services.
-->

---

# Service Communication

```mermaid
graph LR
    A[API Gateway] --> B[User Service]
    A --> C[Order Service]
    A --> D[Inventory Service]
    C --> E[Payment Service]
    C --> F[Notification Service]

    subgraph Event Bus
        G[RabbitMQ]
    end

    C -.-> G
    D -.-> G
    E -.-> G
```

<!--
Sync calls via REST, async events via RabbitMQ.
-->

---

# Implementation: API Gateway

```ts {1-3|5-9|11-15|all}
// Kong configuration
const gateway = new KongGateway({
  services: ['user', 'order', 'inventory', 'payment']
})

// Route configuration
gateway.route('/api/users/*', {
  service: 'user-service',
  stripPrefix: true
})

// Rate limiting per service
gateway.plugin('rate-limiting', {
  minute: 1000,
  policy: 'redis'
})
```

<!--
[click] Initialize gateway with our services
[click] Define routing rules
[click] Add rate limiting for protection
[click] Simple but powerful configuration
-->

---

# Database Migration

<v-clicks>

- Each service owns its data
- No shared databases
- Event-driven sync when needed
- Eventual consistency accepted

</v-clicks>

```mermaid {scale: 0.8}
graph TB
    subgraph Before
        A[Monolith] --> B[(Single DB)]
    end

    subgraph After
        C[User Service] --> D[(User DB)]
        E[Order Service] --> F[(Order DB)]
        G[Inventory Service] --> H[(Inventory DB)]
    end
```

<!--
The hardest part was splitting the database. We went with database-per-service.
-->

---
layout: fact
---

# 15 minutes
Average deployment time (was 4 hours)

<!--
This is our biggest win. Let that sink in.
-->

---
layout: two-cols
---

# Before

- 4-hour deployments
- 30% failure rate
- 45-min builds
- Weekend-only releases
- Teams blocked

::right::

# After

- 15-min deployments
- 2% failure rate
- 5-min builds
- 20 deploys/day
- Independent teams

<!--
The transformation was dramatic across every metric.
-->

---

# Key Metrics

<div class="grid grid-cols-3 gap-8 mt-8">
  <div class="text-center">
    <div class="text-5xl font-bold text-blue-500">94%</div>
    <div class="text-sm opacity-75 mt-2">Faster Deployments</div>
  </div>
  <div class="text-center">
    <div class="text-5xl font-bold text-green-500">10x</div>
    <div class="text-sm opacity-75 mt-2">More Deploys/Day</div>
  </div>
  <div class="text-center">
    <div class="text-5xl font-bold text-purple-500">89%</div>
    <div class="text-sm opacity-75 mt-2">Build Time Reduction</div>
  </div>
</div>

<!--
These numbers speak for themselves.
-->

---
layout: quote
---

# "We ship features in days, not months. Teams move independently. It changed everything."

Engineering Director

<!--
This quote from our director summarizes the cultural shift.
-->

---
layout: end
---

# Thank You!

<div class="mt-8">

**Resources**
- Blog: engineering.example.com/microservices
- Code: github.com/example/migration-toolkit

**Contact**
- jane@example.com
- @janesmith

</div>

<!--
Thank you! Happy to take questions.
-->
```
