# Poll Feature - Database Schema Analysis

## Overview

The poll system is built on a robust PostgreSQL database architecture with three core tables that handle poll creation, options, and user responses. The schema is designed for multi-tenant support, data integrity, and optimal performance.

## Database Tables

### 1. `event_poll` - Main Poll Configuration

#### Table Structure
```sql
CREATE TABLE public.event_poll (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    is_anonymous boolean DEFAULT false,
    allow_multiple_choices boolean DEFAULT false,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    max_responses_per_user integer DEFAULT 1,
    results_visible_to character varying(50) DEFAULT 'ALL'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    event_id bigint,
    created_by_id bigint,
    CONSTRAINT check_max_responses_positive CHECK ((max_responses_per_user > 0)),
    CONSTRAINT check_poll_dates CHECK (((end_date IS NULL) OR (end_date >= start_date))),
    CONSTRAINT event_poll_pkey PRIMARY KEY (id)
);
```

#### Field Analysis

| Field | Type | Description | Constraints | Business Logic |
|-------|------|-------------|-------------|----------------|
| `id` | bigint | Unique poll identifier | Primary Key, Auto-increment | System-generated unique ID |
| `tenant_id` | varchar(255) | Multi-tenant identifier | Optional | Links poll to specific tenant/organization |
| `title` | varchar(255) | Poll title/name | NOT NULL | Human-readable poll identifier |
| `description` | text | Detailed poll description | Optional | Additional context for voters |
| `is_active` | boolean | Poll availability status | Default: true | Controls whether poll is accessible |
| `is_anonymous` | boolean | Anonymous voting setting | Default: false | Determines if votes are anonymous |
| `allow_multiple_choices` | boolean | Multiple choice support | Default: false | Allows users to select multiple options |
| `start_date` | timestamp | Poll start date/time | NOT NULL | When voting begins |
| `end_date` | timestamp | Poll end date/time | Optional | When voting ends (NULL = no end) |
| `max_responses_per_user` | integer | Max votes per user | Default: 1, > 0 | Prevents vote flooding |
| `results_visible_to` | varchar(50) | Results visibility control | Default: 'ALL' | Who can see poll results |
| `event_id` | bigint | Associated event | Foreign Key | Links poll to specific event |
| `created_by_id` | bigint | Poll creator | Foreign Key | User who created the poll |

#### Business Rules
- **Date Validation**: End date must be after start date (if specified)
- **Response Limits**: Maximum responses per user must be positive
- **Event Association**: Every poll must be associated with an event
- **Creator Tracking**: Poll creator is tracked for audit purposes

### 2. `event_poll_option` - Poll Choices and Options

#### Table Structure
```sql
CREATE TABLE public.event_poll_option (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    option_text character varying(500) NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint,
    CONSTRAINT event_poll_option_pkey PRIMARY KEY (id)
);
```

#### Field Analysis

| Field | Type | Description | Constraints | Business Logic |
|-------|------|-------------|-------------|----------------|
| `id` | bigint | Unique option identifier | Primary Key, Auto-increment | System-generated unique ID |
| `tenant_id` | varchar(255) | Multi-tenant identifier | Optional | Links option to specific tenant |
| `option_text` | varchar(500) | Option text/description | NOT NULL | The actual choice text |
| `display_order` | integer | Display sequence | Default: 0 | Controls option ordering |
| `is_active` | boolean | Option availability | Default: true | Can disable individual options |
| `poll_id` | bigint | Associated poll | Foreign Key | Links option to specific poll |

#### Business Rules
- **Text Required**: Option text is mandatory for all choices
- **Ordering**: Display order controls the sequence of options
- **Active Status**: Individual options can be disabled without deleting
- **Poll Association**: Every option must belong to a poll

### 3. `event_poll_response` - User Votes and Responses

#### Table Structure
```sql
CREATE TABLE public.event_poll_response (
    id bigint DEFAULT nextval('public.sequence_generator'::regclass) NOT NULL,
    tenant_id character varying(255),
    comment text,
    response_value character varying(1000),
    is_anonymous boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    poll_id bigint,
    poll_option_id bigint,
    user_id bigint
);
```

#### Field Analysis

| Field | Type | Description | Constraints | Business Logic |
|-------|------|-------------|-------------|----------------|
| `id` | bigint | Unique response identifier | Primary Key, Auto-increment | System-generated unique ID |
| `tenant_id` | varchar(255) | Multi-tenant identifier | Optional | Links response to specific tenant |
| `comment` | text | Additional feedback | Optional | User's additional comments |
| `response_value` | varchar(1000) | Custom response value | Optional | For custom/rating responses |
| `is_anonymous` | boolean | Anonymous response flag | Default: false | Overrides poll-level setting |
| `poll_id` | bigint | Associated poll | Foreign Key | Links response to specific poll |
| `poll_option_id` | bigint | Selected option | Foreign Key | Links to chosen option |
| `user_id` | bigint | Voter identifier | Foreign Key | Links to user profile |

#### Business Rules
- **Response Tracking**: Every response is linked to a poll and option
- **User Association**: User ID is optional for anonymous responses
- **Comment Support**: Additional feedback can be provided
- **Custom Values**: Support for rating or custom response types

## Database Relationships

### Foreign Key Constraints

#### 1. Poll to Event Relationship
```sql
ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__event_id
    FOREIGN KEY (event_id)
    REFERENCES public.event_details(id)
    ON DELETE CASCADE;
```
- **Cascade Delete**: When an event is deleted, all associated polls are removed
- **Event Association**: Every poll must be associated with a valid event

#### 2. Poll to User Relationship
```sql
ALTER TABLE ONLY public.event_poll
    ADD CONSTRAINT fk_poll__created_by_id
    FOREIGN KEY (created_by_id)
    REFERENCES public.user_profile(id)
    ON DELETE SET NULL;
```
- **Set Null Delete**: If poll creator is deleted, created_by_id becomes NULL
- **Creator Tracking**: Maintains audit trail of who created each poll

#### 3. Poll Option to Poll Relationship
```sql
ALTER TABLE ONLY public.event_poll_option
    ADD CONSTRAINT fk_poll_option__poll_id
    FOREIGN KEY (poll_id)
    REFERENCES public.event_poll(id)
    ON DELETE CASCADE;
```
- **Cascade Delete**: When a poll is deleted, all options are removed
- **Option Association**: Every option must belong to a valid poll

#### 4. Poll Response to Poll Relationship
```sql
ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_id
    FOREIGN KEY (poll_id)
    REFERENCES public.event_poll(id)
    ON DELETE CASCADE;
```
- **Cascade Delete**: When a poll is deleted, all responses are removed
- **Response Association**: Every response must belong to a valid poll

#### 5. Poll Response to Option Relationship
```sql
ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__poll_option_id
    FOREIGN KEY (poll_option_id)
    REFERENCES public.event_poll_option(id)
    ON DELETE CASCADE;
```
- **Cascade Delete**: When an option is deleted, all responses are removed
- **Option Association**: Every response must reference a valid option

#### 6. Poll Response to User Relationship
```sql
ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT fk_poll_response__user_id
    FOREIGN KEY (user_id)
    REFERENCES public.user_profile(id)
    ON DELETE CASCADE;
```
- **Cascade Delete**: When a user is deleted, all responses are removed
- **User Association**: Links responses to specific users (unless anonymous)

### Unique Constraints

#### 1. User Response Uniqueness
```sql
ALTER TABLE ONLY public.event_poll_response
    ADD CONSTRAINT ux_poll_response_user_option
    UNIQUE (poll_id, poll_option_id, user_id);
```
- **Prevents Duplicate Votes**: A user cannot vote for the same option multiple times
- **Data Integrity**: Ensures vote accuracy and prevents manipulation

## Data Flow and Business Logic

### Poll Creation Flow
1. **Admin Creates Poll**: Sets basic information, dates, and settings
2. **Options Added**: Poll options are created with display order
3. **Poll Activated**: Poll becomes available for voting
4. **Voting Period**: Users can submit responses within date range

### Voting Flow
1. **User Authentication**: User identity is verified
2. **Poll Access**: User can view available polls
3. **Vote Submission**: User selects option(s) and submits
4. **Response Validation**: System checks for duplicate votes
5. **Data Storage**: Response is stored with user association

### Results Processing
1. **Response Aggregation**: Votes are counted by option
2. **Percentage Calculation**: Response percentages are computed
3. **Real-time Updates**: Results are updated as votes come in
4. **Access Control**: Results are displayed based on visibility settings

## Performance Considerations

### Indexing Strategy
- **Primary Keys**: Auto-incrementing IDs for fast lookups
- **Foreign Keys**: Indexed for efficient joins
- **Tenant ID**: Indexed for multi-tenant queries
- **Date Fields**: Indexed for time-based queries

### Query Optimization
- **Eager Loading**: Load related data in single queries
- **Pagination**: Limit result sets for large datasets
- **Caching**: Cache frequently accessed poll data
- **Connection Pooling**: Efficient database connection management

### Scalability Features
- **Multi-tenant Support**: Efficient tenant isolation
- **Horizontal Scaling**: Support for multiple database instances
- **Data Partitioning**: Partition large tables by date or tenant
- **Archive Strategy**: Move old data to archive tables

## Data Validation Rules

### Poll Level Validation
- Title must not be empty
- Start date must be in the future
- End date must be after start date
- Maximum responses per user must be positive

### Option Level Validation
- Option text must not be empty
- Display order must be non-negative
- Option must belong to an active poll

### Response Level Validation
- User cannot vote multiple times for same option
- Response must be within poll date range
- User must have permission to vote
- Anonymous responses must not include user ID

## Security Considerations

### Data Privacy
- **Anonymous Voting**: Support for completely anonymous responses
- **User Consent**: Clear indication of data collection
- **Data Retention**: Automatic cleanup of old poll data
- **Access Control**: Role-based permissions for poll management

### Data Integrity
- **Vote Validation**: Prevention of duplicate and invalid votes
- **Input Sanitization**: Protection against malicious input
- **SQL Injection**: Parameterized queries for all database operations
- **XSS Protection**: Sanitization of user-generated content

## Sample Data Analysis

### Current Poll Examples
Based on the sample data, the system supports various poll types:

1. **Feedback Polls**: "Spring Gala Feedback" with rating options
2. **Topic Selection**: "Tech Conference Topics" with multiple choices
3. **Event Surveys**: "Charity Run Survey" with anonymous responses
4. **Preference Voting**: "Family Picnic Games" with multiple selections
5. **Menu Selection**: "VIP Dinner Menu" with single choice

### Response Patterns
- **Comment Support**: Users can provide additional feedback
- **Anonymous Responses**: Some polls allow anonymous participation
- **Multiple Choices**: Support for selecting multiple options
- **Real-time Updates**: Responses are tracked with timestamps

## Future Enhancements

### Schema Extensions
- **Poll Templates**: Reusable poll configurations
- **Advanced Options**: Image, file, or rich text options
- **Conditional Logic**: Show/hide options based on responses
- **Branching Questions**: Multi-step survey flows

### Performance Improvements
- **Materialized Views**: Pre-computed result summaries
- **Partitioning**: Time-based table partitioning
- **Read Replicas**: Separate read/write databases
- **CDN Integration**: Global content delivery for media

### Integration Features
- **Webhook Support**: Real-time notifications to external systems
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Export Formats**: Multiple data export options
- **Analytics Integration**: Third-party analytics platform support

## Conclusion

The poll system database schema provides a solid foundation for a comprehensive voting and survey platform. The design emphasizes data integrity, performance, and scalability while maintaining flexibility for future enhancements.

Key strengths include:
- **Robust Relationships**: Proper foreign key constraints and cascading deletes
- **Multi-tenant Support**: Efficient tenant isolation and data management
- **Flexible Configuration**: Support for various poll types and settings
- **Data Integrity**: Unique constraints and validation rules
- **Performance Optimization**: Strategic indexing and query optimization

The schema is ready for immediate implementation and can support the full range of poll functionality described in the PRD.
