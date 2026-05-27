<?php

namespace App\Domains\LeaveManagement\DTOs;

class LeaveApplicationDTO
{
    public function __construct(
        public readonly string $userId,
        public readonly string $type,
        public readonly string $startDate,
        public readonly string $endDate,
        public readonly string $reason,
        public readonly string $status = 'pending'
    ) {}

    public static function fromRequest(array $data, string $userId): self
    {
        return new self(
            userId: $userId,
            type: $data['type'],
            startDate: $data['start_date'],
            endDate: $data['end_date'],
            reason: $data['reason']
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'type' => $this->type,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'reason' => $this->reason,
            'status' => $this->status,
            'created_at' => now()->toIso8601String(),
        ];
    }
}
