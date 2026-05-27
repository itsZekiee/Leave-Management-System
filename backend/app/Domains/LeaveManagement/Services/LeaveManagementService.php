<?php

namespace App\Domains\LeaveManagement\Services;

use App\Domains\LeaveManagement\DTOs\LeaveApplicationDTO;
use Kreait\Firebase\Contract\Firestore;

class LeaveManagementService
{
    protected $database;
    protected $collection = 'leave_applications';

    public function __construct(Firestore $firestore)
    {
        $this->database = $firestore->database();
    }

    /**
     * Submit a new leave application to Firestore.
     */
    public function applyForLeave(LeaveApplicationDTO $dto): array
    {
        // Business Logic: Check leave balance (Simulation)
        $this->validateLeaveBalance($dto->userId, $dto->type);

        $docRef = $this->database->collection($this->collection)->newDocument();
        $docRef->set($dto->toArray());

        return array_merge(['id' => $docRef->id()], $dto->toArray());
    }

    /**
     * Get leave history for a specific user.
     */
    public function getUserLeaveHistory(string $userId): array
    {
        $query = $this->database->collection($this->collection)
            ->where('user_id', '=', $userId)
            ->documents();

        $history = [];
        foreach ($query as $document) {
            if ($document->exists()) {
                $history[] = array_merge(['id' => $document->id()], $document->data());
            }
        }

        return $history;
    }

    /**
     * Simulated leave balance validation.
     */
    protected function validateLeaveBalance(string $userId, string $type): void
    {
        // In a real scenario, fetch user balance from Firestore 'users' collection
        // and throw exception if insufficient.
    }
}
