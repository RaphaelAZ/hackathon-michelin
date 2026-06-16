<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Symfony\Component\Yaml\Yaml;

class OpenApiController extends Controller
{
    public function spec(): JsonResponse
    {
        $basePath = base_path('openapi');
        $spec = $this->resolveRefs(
            Yaml::parseFile("{$basePath}/openapi.yaml"),
            $basePath
        );

        return response()->json($spec);
    }

    /** @param array<mixed> $data */
    private function resolveRefs(array $data, string $basePath): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                if (isset($value['$ref']) && ! str_starts_with((string) $value['$ref'], '#')) {
                    $refPath = realpath("{$basePath}/{$value['$ref']}");
                    $data[$key] = $this->resolveRefs(
                        Yaml::parseFile($refPath),
                        dirname($refPath)
                    );
                } else {
                    $data[$key] = $this->resolveRefs($value, $basePath);
                }
            }
        }

        return $data;
    }
}
